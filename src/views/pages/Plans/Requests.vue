<template>
    <div>
        <v-sheet dark
            color="primary"
            class="pa-2 elevation-4 rounded-t"> 
                <v-row no-gutters>
                    <v-col cols="12" sm="3">
                        <v-select v-model="search.field"
                            :items="[
                                {
                                    text: 'Company Name', 
                                    value: '__companyName',
                                },
                            ]"
                            :item-value="item => item"
                            light
                            flat
                            solo
                            hide-details/>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field
                            v-model="search.term"
                            flat
                            solo-inverted
                            hide-details
                            clearable
                            prepend-inner-icon="mdi-magnify"
                            type="search"
                            :label="`Search Custom Plan Requests by ${search.field.text}`"/>
                    </v-col>
                </v-row>
        </v-sheet>
        <v-data-iterator
            :items="customPlanRequests"
            :loading="isLoadingCustomPlanRequests"
            :server-items-length="pagination.itemsTotalCount"
            :sort-by.sync="pagination.sortBy"
            :sort-desc.sync="pagination.sortDesc"
            must-sort
            hide-default-footer>
                <template v-slot:header>
                    <v-sheet color="white" style="border: thin solid rgba(0, 0, 0, 0.12) !important">
                        <div class="table-top px-6">
                            <v-row>
                                <v-col cols="12" md="9"></v-col>
                                <v-col cols="12" md="3" class="d-flex align-center justify-end">
                                    <v-tooltip left>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn 
                                                v-on="on"
                                                v-bind="attrs"
                                                class="mr-2" 
                                                color="secondary" 
                                                icon 
                                                small
                                                @click="reloadCustomPlanRequests()"
                                                :loading="isReloadingCustomPlanRequests">
                                                    <v-icon>mdi-refresh</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Reload</span>
                                    </v-tooltip>
                                    <div class="caption text-right">
                                        showing {{ customPlanRequests.length }} of {{ pagination.itemsTotalCount }} results
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                    </v-sheet>
                </template>
                <template v-slot:default="props">
                    <v-row>
                        <v-col 
                            v-for="(column, columnIndex) in 3"
                            :key="`column-${column}`"
                            cols="12"
                            sm="6" 
                            md="4">
                                <template
                                    v-for="(customPlanRequest, requestIndex) in props.items">
                                        <v-card 
                                            outlined
                                            elevation="1"
                                            color="white"
                                            class="py-2"
                                            :key="`custom-plan-request-${customPlanRequest.id}`"
                                            v-if="(requestIndex % 3) === columnIndex">
                                                <div class="d-flex justify-space-between">
                                                    <div class="d-flex">
                                                        <div class="py-2 px-4">
                                                            <v-avatar size="40" tile>
                                                                <v-img :src="customPlanRequest.company.logo.src"/>
                                                            </v-avatar>
                                                        </div>
                                                        <div class="pa-2">
                                                            <div class="text-body-1 primary--text">Company</div>
                                                            <div class="text-body-2">
                                                                <span>{{ customPlanRequest.company.name }}</span>
                                                                <span class="px-2">-</span>
                                                                <span class="text-caption">{{ customPlanRequest.company.employeesTotalCount }} employee(s)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="pa-2">
                                                        <v-tooltip top>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn icon 
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                                    color="red" 
                                                                    :loading="isRemovingCustomPlanRequests[customPlanRequest.id]"
                                                                    @click="removeCustomPlanRequest(customPlanRequest)">
                                                                        <v-icon>mdi-close</v-icon>
                                                                </v-btn>
                                                            </template>
                                                            <span>Remove</span>
                                                        </v-tooltip>
                                                    </div>
                                                </div>
                                                <v-divider/>
                                                <v-card-text>
                                                    <div class="text-body-1 primary--text">Request Details</div>
                                                    <div>{{ customPlanRequest.details }}</div>
                                                    <div class="pt-3">
                                                        <div class="text-body-1 primary--text">Essential Courses</div>
                                                        <div>
                                                            <v-chip 
                                                                v-for="course in customPlanRequest.essentialCourses"
                                                                :key="`essential-course-${course.id}`"
                                                                class="label mt-2 mr-3"
                                                                color="white"
                                                                text-color="secondary"
                                                                label
                                                                small>
                                                                    <strong>{{ course.name }}</strong>
                                                            </v-chip>
                                                        </div>
                                                    </div>
                                                </v-card-text>
                                                <v-divider/>
                                                <v-card-actions>
                                                    <v-btn 
                                                        color="primary"
                                                        block
                                                        outlined
                                                        @click="showCreateCustomPlanDialogForRequest(customPlanRequest)">
                                                            Create Custom Plan
                                                    </v-btn>
                                                </v-card-actions>
                                        </v-card>
                                </template>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:footer v-if="(pagination.itemsTotalCount > customPlanRequests.length) && !isLoadingCustomPlanRequests">
                    <div class="table-bottom px-6">
                        <v-row>
                            <v-col cols="12">
                                <div style="display:flex;justify-content:space-around;">
                                    <v-btn color="primary"
                                        text
                                        @click="loadMoreCustomPlanRequests()">
                                            Load More ...
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>
        </v-data-iterator>
        <v-dialog 
            v-model="isShowingCreateCustomPlanDialog"
            max-width="600px"
            persistent>
                <v-card>
                    <v-form ref="createCustomPlanForm" @submit.prevent="createCustomPlan()">
                        <v-card-title>
                            <span class="headline primary--text">Custom Plan for {{ customPlan.company.name }}</span>
                            <v-spacer/>
                            <v-btn
                                icon
                                color="primary"
                                @click="isShowingCreateCustomPlanDialog = false;">
                                    <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field 
                                        v-model="customPlan.name"
                                        label="Name"
                                        :rules="[required]" 
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="customPlan.description"
                                        label="Description"
                                        rows="2"
                                        auto-grow
                                        :rules="[required]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model.number="customPlan.licensedNumberOfEmployees"
                                        label="Licensed Number Of Employees"
                                        type="number"
                                        :rules="[required, min(1)]"
                                        required/>
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete
                                        v-model="customPlan.courseIds"
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
                                        v-model="customPlan.hasBilling" 
                                        :label="`${customPlan.hasBilling ? 'Disable' : 'Enable'} Billing`"/>
                                </v-col>
                                <template v-if="customPlan.hasBilling">
                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="3">
                                                <v-select
                                                    v-model="customPlan.billing.currency"
                                                    label="Billing Currency"
                                                    :items="billing.currencies"
                                                    :rules="[required]"
                                                    required/>
                                            </v-col>
                                            <v-col cols="9">
                                                <v-text-field 
                                                    v-model.number="customPlan.billing.price" 
                                                    label="Billing Price"
                                                    type="number"
                                                    :rules="[required, min(0)]"
                                                    required/>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-select
                                                    v-model="customPlan.billing.interval"
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
                            <v-btn color="primary" type="submit" dark :loading="isCreatingCustomPlan">Create Custom Plan</v-btn>
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

    import moment from 'moment';
    import Case from 'case';
    import { cloneDeep } from 'lodash';
    import { debounce } from 'debounce';

    import validators from '@/mixins/validators';

    const init = {
        search: {
            field: {
                text: 'Company Name', 
                value: '__companyName',
            },
            term: '',
        },
        pagination: {
            limit: 30,
            sortBy: 'createdAt',
            sortDesc: true,
            lastDocument: null,
            itemsTotalCount: 0,
        },
        customPlan: {
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
            company: {
                name: '',
            },
        }
    };

    export default {
        name: 'CustomPlanRequests',
        mixins: [validators],
        data() {
            return {
                customPlanRequests: [],
                pagination: cloneDeep(init.pagination),

                search: cloneDeep(init.search),

                isLoadingCustomPlanRequests: false,
                isReloadingCustomPlanRequests: false,
                isRemovingCustomPlanRequests: {},
                isShowingCreateCustomPlanDialog: false,

                customPlan: cloneDeep(init.customPlan),
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
            };
        },
        computed: {
            query() {
                const { sortBy, sortDesc, limit } = this.pagination;
                const sortOrder = sortDesc ? 'desc' : 'asc';

                return firebase.firestore()
                                .collection(`customPlanRequests`)
                                .orderBy(sortBy, sortOrder)
                                .limit(limit);
            },
            customPlanRequestsTotalCount() {
                return this.$store.state.documentCounters.customPlanRequests;
            },
        },
        watch: {
            query: {
                immediate: true,
                async handler() {
                    this.search = cloneDeep(init.search);

                    await this.loadCustomPlanRequests();
                },
            },
            search: {
                deep: true,
                async handler(search) {
                    if (search.term) {
                        if (search.term.length > 3) {
                            await this.searchCustomPlanRequests();
                        }
                    }
                    else {
                        await this.loadCustomPlanRequests();
                    }
                },
            },
            async searchedCourse(searchedCourse) {
                await this.searchCourses();
            },
        },
        methods: {
            async reloadCustomPlanRequests() {
                this.isReloadingCustomPlanRequests = true;

                await this.loadCustomPlanRequests();

                this.isReloadingCustomPlanRequests = false;
            },
            async loadCustomPlanRequests() {
                this.isLoadingCustomPlanRequests = true;

                this.customPlanRequests = await this.fetchCustomPlanRequests(this.query);

                this.pagination.itemsTotalCount = this.customPlanRequestsTotalCount;

                this.isLoadingCustomPlanRequests = false;
            },
            async loadMoreCustomPlanRequests() {
                this.isLoadingCustomPlanRequests = true;

                const lastDocument = this.pagination.lastDocument;

                const query = this.query.startAfter(lastDocument);

                const newCustomPlanRequests = await this.fetchCustomPlanRequests(query);

                this.customPlanRequests = this.customPlanRequests.concat(newCustomPlanRequests);

                this.isLoadingCustomPlanRequests = false;
            },
            searchCustomPlanRequests: debounce(async function () {
                this.isLoadingCustomPlanRequests = true;

                const searchTerm = Case.lower(this.search.term);
                const searchField = this.search.field.value;

                const query = firebase.firestore()
                                    .collection('customPlanRequests')
                                    .orderBy(searchField)
                                    .startAt(searchTerm)
                                    .endAt(searchTerm + "\uf8ff");

                this.customPlanRequests = await this.fetchcustomPlanRequests(query);

                this.pagination.itemsTotalCount = this.customPlanRequests.length;

                this.isLoadingCustomPlanRequests = false;
            }, 300),
            async fetchCustomPlanRequests(query) {
                return await query
                                .get()
                                .then(async querySnapshot => {
                                    this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                                    const customPlanRequests = [];

                                    querySnapshot.forEach(documentSnapshot => {
                                        const customPlanRequest = {
                                            id: documentSnapshot.id,
                                            ...documentSnapshot.data(),
                                        };

                                        customPlanRequests.push(customPlanRequest);
                                    });

                                    await Promise.all(customPlanRequests.map(async customPlanRequest => {
                                        const companyDocumentSnapshot = await customPlanRequest.company.get();

                                        customPlanRequest.company = {
                                            id: companyDocumentSnapshot.id,
                                            ...companyDocumentSnapshot.data(),
                                        };

                                        customPlanRequest.essentialCourses = await Promise.all(
                                            customPlanRequest.essentialCourses.map(async essentialCourse => {
                                                const courseDocumentSnapshot = await essentialCourse.get();

                                                const course = courseDocumentSnapshot.data() ? {
                                                    id: courseDocumentSnapshot.id,
                                                    ...courseDocumentSnapshot.data(),
                                                } : null;

                                                return course;
                                            })
                                        );

                                        customPlanRequest.essentialCourses = Array.purify(customPlanRequest.essentialCourses);
                                    }));

                                    return customPlanRequests;
                                });
            },
            async removeCustomPlanRequest(customPlanRequest) {
                this.$set(this.isRemovingCustomPlanRequests, customPlanRequest.id, true);

                try {
                    const removeCustomPlanRequest = firebase.functions()
                                                            .httpsCallable('removeCustomPlanRequest');

                    await removeCustomPlanRequest({ customPlanRequestId: customPlanRequest.id });

                    this.customPlanRequests.splice(this.customPlanRequests.indexOf(customPlanRequest), 1);

                    this.pagination.itemsTotalCount--;
                } catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }

                this.$set(this.isRemovingCustomPlanRequests, customPlanRequest.id, false);
            },
            formatDate(timestamp, format) {
                if (format === 'verbose') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm A");
                }
            },
            showCreateCustomPlanDialogForRequest(customPlanRequest) {
                const { company } = customPlanRequest;

                this.customPlan = Object.assign(this.customPlan, {
                    name: `Custom Plan for ${company.name}`,
                    description: `Custom Plan for ${company.name}. Request Details: ${customPlanRequest.details}.`,
                    licensedNumberOfEmployees: company.employeesTotalCount,
                    courseIds: customPlanRequest.essentialCourses.map(course => course.id),
                    hasBilling: true,
                    company,
                });

                this.foundCourses = customPlanRequest.essentialCourses;

                this.isShowingCreateCustomPlanDialog = true;
            },
            async createCustomPlan() {
                if (!this.$refs.createCustomPlanForm.validate()) {
                    return;
                }

                this.isCreatingCustomPlan = true;

                try {
                    const createCompanyCustomPlan = firebase.functions()
                                                            .httpsCallable('createCompanyCustomPlan');

                    const planData = {
                        name: this.customPlan.name,
                        courseIds: this.customPlan.courseIds,
                        description: this.customPlan.description,
                        licensedNumberOfEmployees: this.customPlan.licensedNumberOfEmployees,
                        billing: this.customPlan.hasBilling ? this.customPlan.billing : null,
                    };

                    const companyId = this.customPlan.company.id;

                    await createCompanyCustomPlan({ planData, companyId });

                    // Remove Custom Plan Request
                    const request = this.customPlanRequests.find(request => {
                        return request.company.id === this.customPlan.company.id;
                    });

                    this.customPlanRequests.splice(this.customPlanRequests.indexOf(request), 1);
                    this.pagination.itemsTotalCount--;

                    // Notify Successful
                    const notification = {
                        message: `The custom plan for ${this.customPlan.company.name} has been successfully created`,
                        context: 'success',
                    };

                    this.$store.commit('push_notification', { notification });

                    this.customPlan = cloneDeep(init.customPlan);
                    this.$refs.createCustomPlanForm.resetValidation();
                    this.isShowingCreateCustomPlanDialog = false;
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isCreatingCustomPlan = false;
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
                const courseIndex = this.customPlan.courseIds.indexOf(course.id);

                this.customPlan.courseIds.splice(courseIndex, 1);
            },
        },
    };
</script>

<style scoped>
    .label::before {
        opacity: 0.12;
    }
</style>