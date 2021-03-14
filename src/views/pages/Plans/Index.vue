<template>
    <div>
        <v-data-iterator
            :items="plans"
            :items-per-page.sync="itemsPerPage"
            hide-default-footer>
                <template v-slot:default="props">
                    <v-row>
                        <v-col 
                            v-for="(column, columnIndex) in 3"
                            :key="`column-${column}`"
                            cols="12" 
                            md="4">
                                <template
                                    v-for="(plan, planIndex) in props.items">
                                        <v-card 
                                            outlined
                                            elevation="1"
                                            color="white"
                                            class="pa-4 mb-6"
                                            :key="`plan-${plan.id}`"
                                            v-if="(planIndex % 3) === columnIndex">
                                                <v-card-title
                                                    class="px-0 pt-0 primary--text">
                                                        {{ plan.name }}
                                                </v-card-title>

                                                <v-card-subtitle 
                                                    class="px-0 pb-0">
                                                        {{ plan.description }}
                                                </v-card-subtitle>

                                                <v-divider class="my-3"/>

                                                <v-card-text 
                                                    class="pa-0">
                                                        <div class="d-flex pb-2">
                                                            <div class="pr-2">
                                                                <strong>{{ plan.licensedNumberOfEmployees }}</strong> Employee License(s),
                                                            </div>
                                                            <div>
                                                                <strong>{{ Array.purify(plan.courses).length }}</strong> Licensed Course(s)
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div 
                                                                v-for="course in Array.purify(plan.courses)" 
                                                                :key="course.id">
                                                                    <v-icon small color="secondary">mdi-check</v-icon>
                                                                    {{ course.name }}
                                                            </div>
                                                        </div>
                                                </v-card-text>

                                                <v-divider class="my-3"/>

                                                <div class="pb-3 primary--text">
                                                    <div v-if="plan.billing">
                                                        <span class="text-h4">{{ plan.billing.currency }} {{ plan.billing.price }}</span>
                                                        <span class="text--secondary"> / {{ plan.billing.interval }}</span>
                                                    </div>
                                                    <div v-else>
                                                        <span class="text-h4">FREE</span>
                                                    </div>
                                                </div>

                                                <div class="d-flex">
                                                    <v-spacer/>
                                                    <v-tooltip top>
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn 
                                                                v-on="on"
                                                                v-bind="attrs"
                                                                class="mr-2" 
                                                                color="purple" 
                                                                icon 
                                                                small
                                                                @click="showUpdatePlanDialogForPlan(plan)">
                                                                    <v-icon>mdi-pencil</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <span>Update</span>
                                                    </v-tooltip>
                                                    <v-tooltip top>
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn 
                                                                v-on="on"
                                                                v-bind="attrs"
                                                                class="mr-2" 
                                                                color="red" 
                                                                icon 
                                                                small
                                                                :loading="isDeletingPlans[plan.id]"
                                                                @click="deletePlan(plan)">
                                                                    <v-icon>mdi-delete</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <span>Delete</span>
                                                    </v-tooltip>
                                                </div>
                                        </v-card>
                                </template>
                        </v-col>
                    </v-row>
                </template>
        </v-data-iterator>
        <v-dialog 
            v-model="isShowingUpdatePlanDialog"
            max-width="600px"
            persistent>
                <v-card>
                    <v-form ref="updatePlanForm" @submit.prevent="updatePlan()">
                        <v-card-title>
                            <span class="headline primary--text">Update Plan</span>
                            <v-spacer/>
                            <v-btn
                                icon
                                color="primary"
                                @click="isShowingUpdatePlanDialog = false;">
                                    <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field 
                                        v-model="updatingPlan.name"
                                        label="Name"
                                        :rules="[required]" 
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="updatingPlan.description"
                                        label="Description"
                                        rows="2"
                                        auto-grow
                                        :rules="[required]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model.number="updatingPlan.licensedNumberOfEmployees"
                                        label="Licensed Number Of Employees"
                                        type="number"
                                        :rules="[required, min(1)]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete
                                        v-model="updatingPlan.courseIds"
                                        :loading="isSearchingCourses"
                                        :items="foundCourses"
                                        :search-input.sync="searchedCourse"
                                        cache-items
                                        chips
                                        label="Courses"
                                        item-text="name"
                                        item-value="id"
                                        multiple
                                        :rules="[nonEmpty]">
                                            <template v-slot:selection="data">
                                                <v-chip
                                                    v-bind="data.attrs"
                                                    :input-value="data.selected"
                                                    close
                                                    @click="data.select"
                                                    @click:close="removeCourse(data.item)"
                                                    color="blue-grey lighten-5"
                                                    text-color="primary"
                                                    label>
                                                        {{ data.item.name }}
                                                </v-chip>
                                            </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <v-switch
                                        v-model="updatingPlan.hasBilling" 
                                        :label="`${updatingPlan.hasBilling ? 'Disable' : 'Enable'} Billing`"/>
                                </v-col>
                                <template v-if="updatingPlan.hasBilling">
                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="3">
                                                <v-select
                                                    v-model="updatingPlan.billing.currency"
                                                    label="Billing Currency"
                                                    :items="billing.currencies"
                                                    :rules="[required]"
                                                    required/>
                                            </v-col>
                                            <v-col cols="9">
                                                <v-text-field 
                                                    v-model.number="updatingPlan.billing.price" 
                                                    label="Billing Price"
                                                    type="number"
                                                    :rules="[required, min(0)]"
                                                    required/>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-select
                                                    v-model="updatingPlan.billing.interval"
                                                    label="Billing Interval"
                                                    :items="billing.intervals"
                                                    :rules="[required]"
                                                    required/>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </template>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer/>
                            <v-btn color="primary" type="submit" dark :loading="isUpdatingPlan">Update Plan</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';
    import 'firebase/firestore';

    import { cloneDeep } from 'lodash';
    import { debounce } from 'debounce';

    import validators from '@/mixins/validators';

    const init = {
        updatingPlan: {
            id: '',
            name: '',
            description: '',
            licensedNumberOfEmployees: null,
            courseIds: [],
            hasBilling: false,
            billing: {
                currency: 'GHS',
                interval: 'monthly',
                price: null,
            },
        }
    };

    export default {
        name: 'PlansIndex',
        mixins: [validators],
        data() {
            return {
                plans: [],
                itemsPerPage: 10,

                isShowingUpdatePlanDialog: false,
                isUpdatingPlan: false,
                updatingPlan: cloneDeep(init.updatingPlan),
                billing: {
                    currencies: ['GHS','NGN'],
                    intervals: [
                        'monthly',
                        'biannually',
                        'annually',
                        'biennially'
                    ],
                },
                isSearchingCourses: false,
                foundCourses: [],
                searchedCourse: '',
                isCreatingCustomPlan: false,

                isDeletingPlans: {},
            };
        },
        watch: {
            async searchedCourse(searchedCourse) {
                await this.searchCourses();
            },
        },
        methods: {
            async deletePlan(plan) {
                this.$set(this.isDeletingPlans, plan.id, true);

                try {
                    const deletePlan = firebase.functions()
                                                .httpsCallable('deletePlan');

                    await deletePlan({ planId: plan.id });
                } 
                catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }

                this.$set(this.isDeletingPlans, plan.id, false);
            },
            searchCourses: debounce(async function () {
                if (this.searchedCourse && (this.searchedCourse.length > 3)) {
                    this.isSearchingCourses = true;

                    const query = firebase.firestore()
                                            .collection('courses')
                                            .orderBy('__name')
                                            .startAt(this.searchedCourse)
                                            .endAt(this.searchedCourse + "\uf8ff");

                    await this.$bind('foundCourses', query);

                    this.isSearchingCourses = false;
                }
            }, 300),
            removeCourse(course) {
                const courseIndex = this.updatingPlan.courseIds.indexOf(course.id);

                this.updatingPlan.courseIds.splice(courseIndex, 1);
            },
            showUpdatePlanDialogForPlan(plan) {
                this.updatingPlan = {
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    licensedNumberOfEmployees: plan.licensedNumberOfEmployees,
                    courseIds: plan.courses.map(course => course.id),
                    hasBilling: plan.billing !== null,
                    billing: plan.billing ? plan.billing : cloneDeep(init.updatingPlan.billing),
                };

                this.foundCourses = plan.courses;

                this.isShowingUpdatePlanDialog = true;
            },
            async updatePlan() {
                if (!this.$refs.updatePlanForm.validate()) {
                    return;
                }

                this.isUpdatingPlan = true;

                try {
                    const updatePlan = firebase.functions()
                                                .httpsCallable('updatePlan');

                    const planData = {
                        name: this.updatingPlan.name,
                        courseIds: this.updatingPlan.courseIds,
                        description: this.updatingPlan.description,
                        licensedNumberOfEmployees: this.updatingPlan.licensedNumberOfEmployees,
                        billing: this.updatingPlan.hasBilling ? this.updatingPlan.billing : null,
                    };

                    await updatePlan({ planId: this.updatingPlan.id, planData });

                    this.updatingPlan = cloneDeep(init.updatingPlan);
                    this.$refs.updatePlanForm.resetValidation();
                    this.isShowingUpdatePlanDialog = false;
                } 
                catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isCreatingCustomPlan = false;
            },
        },
        firestore() {
            return {
                plans: firebase.firestore().collection(`plans`),
            };
        }
    };
</script>

<style lang="scss" scoped>
    .three-line-clamped {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        height: 6rem;
        -webkit-line-clamp: 3; /* number of lines to show */
        -webkit-box-orient: vertical;

        .text-body-2 {
            line-height: 2rem;
        }
    }
</style>