<template>
    <v-card>
        <v-form ref="addPlanForm" @submit.prevent="addPlan()">
            <v-card-title>
                <span class="headline primary--text">Add A Plan</span>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="newPlan.name"
                            label="Name"
                            :rules="[required]" 
                            required/>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea
                            v-model="newPlan.description"
                            label="Description"
                            rows="2"
                            auto-grow
                            :rules="[required]"
                            required/>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model.number="newPlan.licensedNumberOfEmployees"
                            label="Licensed Number Of Employees"
                            type="number"
                            :rules="[required, min(1)]"
                            required/>
                    </v-col>
                    <v-col cols="12">
                        <v-autocomplete
                            v-model="newPlan.courseIds"
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
                            v-model="newPlan.hasBilling" 
                            :label="`${newPlan.hasBilling ? 'Disable' : 'Enable'} Billing`"/>
                    </v-col>
                    <template v-if="newPlan.hasBilling">
                        <v-col cols="12">
                            <v-row>
                                <v-col cols="3">
                                    <v-select
                                        v-model="newPlan.billing.currency"
                                        label="Billing Currency"
                                        :items="billing.currencies"
                                        :rules="[required]"
                                        required/>
                                </v-col>
                                <v-col cols="9">
                                    <v-text-field 
                                        v-model.number="newPlan.billing.price" 
                                        label="Billing Price"
                                        type="number"
                                        :rules="[required, min(0)]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-select
                                        v-model="newPlan.billing.interval"
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
                <v-btn color="primary" type="submit" dark :loading="isAddingNewPlan">Add Plan</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';
    import 'firebase/functions';

    import { debounce } from 'debounce';
    import { cloneDeep } from 'lodash';

    import validators from '@/mixins/validators';

    const init = {
        newPlan: {
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
        name: 'CreatePlan',
        mixins: [validators],
        data() {
            return {
                newPlan: cloneDeep(init.newPlan),
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
                isAddingNewPlan: false,
            };
        },
        watch: {
            async searchedCourse(searchedCourse) {
                await this.searchCourses();
            }
        },
        methods: {
            async addPlan() {
                if (!this.$refs.addPlanForm.validate()) {
                    return;
                }

                this.isAddingNewPlan = true;

                try {
                    const addPlan = firebase.functions()
                                            .httpsCallable('addPlan');

                    const planData = {
                        name: this.newPlan.name,
                        courseIds: this.newPlan.courseIds,
                        description: this.newPlan.description,
                        licensedNumberOfEmployees: this.newPlan.licensedNumberOfEmployees,
                        billing: this.newPlan.hasBilling ? this.newPlan.billing : null,
                    };

                    await addPlan({ planData });

                    this.newPlan = cloneDeep(init.newPlan);
                    this.$refs.addPlanForm.resetValidation();
                    this.$router.push('/plans');
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isAddingNewPlan = false;
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
                const courseIndex = this.newPlan.courseIds.indexOf(course.id);

                this.newPlan.courseIds.splice(courseIndex, 1);
            },
        },
    };
</script>