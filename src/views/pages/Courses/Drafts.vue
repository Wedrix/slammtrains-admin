<template>
    <v-data-table
        :headers="headers"
        :items="courseDrafts"
        :loading="isLoadingCourseDrafts"
        :server-items-length="pagination.itemsTotalCount"
        :sort-by.sync="pagination.sortBy"
        :sort-desc.sync="pagination.sortDesc"
        class="elevation-1"
        must-sort
        hide-default-footer
        hide-default-header
        :headers-length="3"
        @click:row="$router.push(`/courses/create?draftId=${$event.id}`)">
            <template v-slot:[`item.name`]="{ item }">
                {{ item.name ? item.name : '(no name)' }}
            </template>
            <template v-slot:[`item.createdAt`]="{ item }">
                {{ formatDate(item.createdAt) }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon 
                            v-bind="attrs"
                            v-on="on"
                            color="red" 
                            @click.stop="deleteCourseDraft(item.id)"
                            :loading="isDeletingCourseDrafts[item.id]">
                                <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>
                    <span>Delete</span>
                </v-tooltip>
            </template>
            <template v-slot:top>
                <div class="table-top px-6">
                    <v-row>
                        <v-col cols="12" md="9">
                            <div class="headline primary--text">Course Drafts</div>
                        </v-col>
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
                                        @click="reloadCourseDrafts()"
                                        :loading="isReloadingCourseDrafts">
                                            <v-icon>mdi-refresh</v-icon>
                                    </v-btn>
                                </template>
                                <span>Reload</span>
                            </v-tooltip>
                            <div class="caption text-right">
                                showing {{ courseDrafts.length }} of {{ pagination.itemsTotalCount }} results
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </template>
    </v-data-table>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';

    import moment from 'moment';
    
    import { cloneDeep } from 'lodash';

    const init = {
        pagination: {
            limit: 30,
            sortBy: 'createdAt',
            sortDesc: true,
            lastDocument: null,
            itemsTotalCount: 0,
        },
    };

    export default {
        name: 'CourseDrafts',
        data() {
            return {
                headers: [
                    {
                        text: 'Name',
                        value: 'name',
                        sortable: false,
                    },
                    {
                        text: 'Created At',
                        value: 'createdAt',
                    },
                    {
                        text: 'Actions',
                        value: 'actions',
                        align: 'center',
                        sortable: false,
                    }
                ],
                courseDrafts: [],
                pagination: cloneDeep(init.pagination),

                isLoadingCourseDrafts: false,
                isReloadingCourseDrafts: false,
                isDeletingCourseDrafts: {},
            };
        },
        computed: {
            query() {
                const { sortBy, sortDesc, limit } = this.pagination;
                const sortOrder = sortDesc ? 'desc' : 'asc';

                return firebase.firestore()
                                .collection(`courseDrafts`)
                                .orderBy(sortBy, sortOrder)
                                .limit(limit);
            },
            courseDraftsTotalCount() {
                return this.$store.state.documentCounters.courseDrafts;
            },
        },
        watch: {
            query: {
                immediate: true,
                async handler() {
                    await this.loadCourseDrafts();
                },
            },
        },
        methods: {
            async reloadCourseDrafts() {
                this.isReloadingCourseDrafts = true;

                await this.loadCourseDrafts();

                this.isReloadingCourseDrafts = false;
            },
            async loadCourseDrafts() {
                this.isLoadingCourseDrafts = true;

                this.courseDrafts = await this.fetchCourseDrafts(this.query);

                this.pagination.itemsTotalCount = this.courseDraftsTotalCount;

                this.isLoadingCourseDrafts = false;
            },
            async loadMoreCourseDrafts() {
                this.isLoadingCourseDrafts = true;

                const lastDocument = this.pagination.lastDocument;

                const query = this.query.startAfter(lastDocument);

                const newCourseDrafts = await this.fetchCourseDrafts(query);

                this.courseDrafts = this.courseDrafts.concat(newCourseDrafts);

                this.isLoadingCourseDrafts = false;
            },
            async fetchCourseDrafts(query) {
                return await query
                                .get()
                                .then(async querySnapshot => {
                                    this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                                    const courseDrafts = [];

                                    querySnapshot.forEach(documentSnapshot => {
                                        const courseDraft = {
                                            id: documentSnapshot.id,
                                            ...documentSnapshot.data(),
                                        };

                                        courseDrafts.push(courseDraft);
                                    });

                                    return courseDrafts;
                                });
            },
            async deleteCourseDraft(courseDraftId) {
                this.$set(this.isDeletingCourseDrafts, courseDraftId, true);

                try {
                    await firebase.firestore()
                                .doc(`courseDrafts/${courseDraftId}`)
                                .delete();
                } 
                catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }

                this.$set(this.isDeletingCourseDrafts, courseDraftId, false);

                await this.reloadCourseDrafts();

                this.pagination.itemsTotalCount--;
            },
            formatDate(timestamp) {
                const date = moment(timestamp);

                if (date.diff(moment(), 'days') < 1) {
                    return date.format("h:mm A");
                }

                return date.format("MM/DD/YY");
            },
        },
    };
</script>

<style scoped>
    .table-top {
        border-bottom: thin solid rgba(0, 0, 0, 0.12);
    }
    .table-bottom {
        border-top: thin solid rgba(0, 0, 0, 0.12);
    }
</style>