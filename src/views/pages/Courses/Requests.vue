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
                                    text: 'Course Name', 
                                    value: '__courseName',
                                },
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
                            :label="`Search Course Requests by ${search.field.text}`"/>
                    </v-col>
                </v-row>
        </v-sheet>
        <v-data-iterator
            :items="courseRequests"
            :loading="isLoadingCourseRequests"
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
                                                @click="reloadCourseRequests()"
                                                :loading="isReloadingCourseRequests">
                                                    <v-icon>mdi-refresh</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Reload</span>
                                    </v-tooltip>
                                    <div class="caption text-right">
                                        showing {{ courseRequests.length }} of {{ pagination.itemsTotalCount }} results
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
                                    v-for="(courseRequest, requestIndex) in props.items">
                                        <v-card 
                                            outlined
                                            elevation="1"
                                            color="white"
                                            class="py-2"
                                            :key="`course-request-${courseRequest.id}`"
                                            v-if="(requestIndex % 3) === columnIndex">
                                                <div class="d-flex justify-space-between">
                                                    <div class="d-flex">
                                                        <div class="py-2 px-4">
                                                            <v-avatar size="40" tile>
                                                                <v-img :src="courseRequest.company.logo.src"/>
                                                            </v-avatar>
                                                        </div>
                                                        <div class="pa-2">
                                                            <div class="text-body-1 primary--text">Company</div>
                                                            <div class="text-body-2">
                                                                <span>{{ courseRequest.company.name }}</span>
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
                                                                    :loading="isRemovingCourseRequests[courseRequest.id]"
                                                                    @click="removeCourseRequest(courseRequest)">
                                                                        <v-icon>mdi-close</v-icon>
                                                                </v-btn>
                                                            </template>
                                                            <span>Remove</span>
                                                        </v-tooltip>
                                                    </div>
                                                </div>
                                                <v-divider/>
                                                <v-card-text>
                                                    <div class="text-body-1 primary--text">Course Name</div>
                                                    <div>{{ courseRequest.courseName }}</div>
                                                    <div class="pt-3">
                                                        <div class="text-body-1 primary--text">Request Details</div>
                                                        <div>{{ courseRequest.details }}</div>
                                                    </div>
                                                </v-card-text>
                                        </v-card>
                                </template>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:footer v-if="(pagination.itemsTotalCount > courseRequests.length) && !isLoadingCourseRequests">
                    <div class="table-bottom px-6">
                        <v-row>
                            <v-col cols="12">
                                <div style="display:flex;justify-content:space-around;">
                                    <v-btn color="primary"
                                        text
                                        @click="loadMoreCourseRequests()">
                                            Load More ...
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>
        </v-data-iterator>
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

    const init = {
        search: {
            field: {
                text: 'Course Name',
                value: '__courseName'
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
    };

    export default {
        name: 'CourseRequests',
        data() {
            return {
                courseRequests: [],
                pagination: cloneDeep(init.pagination),

                search: cloneDeep(init.search),

                isLoadingCourseRequests: false,
                isReloadingCourseRequests: false,
                isRemovingCourseRequests: {},
            };
        },
        computed: {
            query() {
                const { sortBy, sortDesc, limit } = this.pagination;
                const sortOrder = sortDesc ? 'desc' : 'asc';

                return firebase.firestore()
                                .collection(`courseRequests`)
                                .orderBy(sortBy, sortOrder)
                                .limit(limit);
            },
            courseRequestsTotalCount() {
                return this.$store.state.documentCounters.courseRequests;
            },
        },
        watch: {
            query: {
                immediate: true,
                async handler() {
                    this.search = cloneDeep(init.search);

                    await this.loadCourseRequests();
                },
            },
            search: {
                deep: true,
                async handler(search) {
                    if (search.term) {
                        if (search.term.length > 3) {
                            await this.searchCourseRequests();
                        }
                    }
                    else {
                        await this.loadCourseRequests();
                    }
                },
            },
        },
        methods: {
            async reloadCourseRequests() {
                this.isReloadingCourseRequests = true;

                await this.loadCourseRequests();

                this.isReloadingCourseRequests = false;
            },
            async loadCourseRequests() {
                this.isLoadingCourseRequests = true;

                this.courseRequests = await this.fetchCourseRequests(this.query);

                this.pagination.itemsTotalCount = this.courseRequestsTotalCount;

                this.isLoadingCourseRequests = false;
            },
            async loadMoreCourseRequests() {
                this.isLoadingCourseRequests = true;

                const lastDocument = this.pagination.lastDocument;

                const query = this.query.startAfter(lastDocument);

                const newCourseRequests = await this.fetchCourseRequests(query);

                this.courseRequests = this.courseRequests.concat(newCourseRequests);

                this.isLoadingCourseRequests = false;
            },
            searchCourseRequests: debounce(async function () {
                this.isLoadingCourseRequests = true;

                const searchTerm = Case.lower(this.search.term);
                const searchField = this.search.field.value;

                const query = firebase.firestore()
                                    .collection('courseRequests')
                                    .orderBy(searchField)
                                    .startAt(searchTerm)
                                    .endAt(searchTerm + "\uf8ff");

                this.courseRequests = await this.fetchCourseRequests(query);

                this.pagination.itemsTotalCount = this.courseRequests.length;

                this.isLoadingCourseRequests = false;
            }, 300),
            async fetchCourseRequests(query) {
                return await query
                                .get()
                                .then(async querySnapshot => {
                                    this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                                    const courseRequests = [];

                                    querySnapshot.forEach(documentSnapshot => {
                                        const courseRequest = {
                                            id: documentSnapshot.id,
                                            ...documentSnapshot.data(),
                                        };

                                        courseRequests.push(courseRequest);
                                    });

                                    await Promise.all(courseRequests.map(async courseRequest => {
                                        courseRequest.company = (await courseRequest.company.get()).data();

                                        return courseRequest;
                                    }));

                                    return courseRequests;
                                });
            },
            async removeCourseRequest(courseRequest) {
                this.$set(this.isRemovingCourseRequests, courseRequest.id, true);

                try {
                    const removeCourseRequest = firebase.functions()
                                                            .httpsCallable('removeCourseRequest');

                    await removeCourseRequest({ courseRequestId: courseRequest.id });

                    this.courseRequests.splice(this.courseRequests.indexOf(courseRequest), 1);

                    this.pagination.itemsTotalCount--;
                } catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }

                this.$set(this.isRemovingCourseRequests, courseRequest.id, false);
            },
            formatDate(timestamp, format) {
                if (format === 'verbose') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm A");
                }
            },
        },
    };
</script>