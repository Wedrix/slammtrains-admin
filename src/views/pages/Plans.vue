<template>
    <v-sheet color="transparent" class="mx-lg-6">
        <v-toolbar
            dark
            extended
            rounded
            color="background"
            class="textured-background">
                <v-toolbar-title class="text-h5">
                    Plans
                </v-toolbar-title>
                <template v-slot:extension>
                    <v-dialog v-model="isShowingAddPlanForm" persistent max-width="600px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn light color="white" class="mr-4" v-bind="attrs" v-on="on">
                                <v-icon left>mdi-plus</v-icon> Add A Plan
                            </v-btn>
                        </template>
                        <v-card>
                            <v-form ref="addPlanForm" @submit.prevent="validate() && addPlan()">
                                <v-card-title>
                                    <span class="headline">Add A Plan</span>
                                    <v-spacer/>
                                    <v-btn color="primary" @click="isShowingAddPlanForm = false;" fab x-small dark>
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
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
                                                :rules="[required]"
                                                required/>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model.number="newPlan.licensedNumberOfEmployees"
                                                label="Licensed Number Of Employees"
                                                type="number"
                                                :rules="[required]"
                                                required/>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-autocomplete
                                                v-model="newPlan.courses"
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
                                                                <v-avatar left tile>
                                                                    <v-img :src="data.item.thumbnail.src"/>
                                                                </v-avatar>
                                                                {{ data.item.name }}
                                                        </v-chip>
                                                    </template>
                                                    <template v-slot:item="data">
                                                        <v-list-item-avatar tile>
                                                            <img :src="data.item.thumbnail.src">
                                                        </v-list-item-avatar>
                                                        <v-list-item-content>
                                                            <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                                                        </v-list-item-content>
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
                                                            :rules="[required]"
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
                    </v-dialog>
                </template>
        </v-toolbar>
        <v-sheet color="transparent">
            <v-data-iterator
                :items="plans"
                :items-per-page.sync="itemsPerPage"
                hide-default-footer>
                    <template v-slot:default="props">
                        <v-card 
                            light
                            outlined
                            elevation="1"
                            color="white">
                                <v-row>
                                    <v-col cols="12" md="3" v-for="plan in props.items" :key="plan.id">
                                        <v-card-title>{{ plan.name }}</v-card-title>
                                        <v-card-subtitle>{{ plan.description }}</v-card-subtitle>
                                        <v-card-text class="primary--text">
                                            <div class="pb-3">
                                                <div v-if="plan.billing">
                                                    <span class="text-h4">{{ plan.billing.currency }} {{ plan.billing.price }}</span>
                                                    <span class="text--secondary"> / {{ plan.billing.interval }}</span>
                                                </div>
                                                <div v-else>
                                                    <span class="text-h4">FREE</span>
                                                </div>
                                            </div>
                                            <div class="d-flex">
                                                <v-btn icon color="accent2">
                                                    <v-icon>mdi-pencil</v-icon>
                                                </v-btn>
                                                <v-btn icon color="accent">
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </div>
                                        </v-card-text>
                                        <v-divider/>
                                        <v-card-text>
                                            <div 
                                                v-for="course in plan.courses" 
                                                :key="course.id" 
                                                class="text-body-2 py-2">
                                                    <v-icon small color="green">mdi-check</v-icon>
                                                    {{ course.name }}
                                            </div>
                                        </v-card-text>
                                    </v-col>
                                </v-row>
                        </v-card>
                    </template>
            </v-data-iterator>
        </v-sheet>
    </v-sheet>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';
    import 'firebase/functions';

    import { debounce } from 'debounce';
    import validators from '@/mixins/validators';

    const init = {
        newPlan: {
            name: '',
            description: '',
            licensedNumberOfEmployees: null,
            courses: [],
            hasBilling: false,
            billing: {
                currency: 'GHS',
                interval: 'monthly',
                price: null,
            },
        }
    };

    export default {
        name: 'Plans',
        mixins: [validators],
        data() {
            return {
                plans: [],
                itemsPerPage: 10,
                isShowingAddPlanForm: false,
                newPlan: { ...init.newPlan },
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
            validate() {
                return this.$refs.addPlanForm.validate();
            },
            async addPlan() {
                this.isAddingNewPlan = true;

                try {
                    const addPlan = firebase.functions()
                                            .httpsCallable('addPlan');

                    const planData = {
                        name: this.newPlan.name,
                        courses: this.newPlan.courses,
                        description: this.newPlan.description,
                        licensedNumberOfEmployees: this.newPlan.licensedNumberOfEmployees,
                        billing: this.newPlan.hasBilling ? this.newPlan.billing : null,
                    };

                    await addPlan({ planData });
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isAddingNewPlan = false;
                this.isShowingAddPlanForm = false;
                this.newPlan = { ...init.newPlan };
            },
            searchCourses: debounce(async function () {
                if (this.searchedCourse && (this.searchedCourse.length > 3)) {
                    this.isSearchingCourses = true;

                    const query = firebase.firestore()
                                            .collection('courses')
                                            .orderBy('name')
                                            .startAt(this.searchedCourse)
                                            .endAt(this.searchedCourse + "\uf8ff");

                    await this.$bind('foundCourses', query);

                    this.isSearchingCourses = false;
                }
            }, 300),
        },
        firestore() {
            return {
                plans: firebase.firestore().collection(`plans`),
            };
        }
    };
</script>