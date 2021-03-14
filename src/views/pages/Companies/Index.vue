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
                                    text: 'Name', 
                                    value: '__name',
                                },
                                {
                                    text: 'Email', 
                                    value: 'email',
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
                            :label="`Search Courses by ${search.field.text}`"/>
                        <v-spacer/>
                    </v-col>
                </v-row>
        </v-sheet>

        <v-data-table
            :headers="headers"
            :items="companies"
            :loading="isLoadingCompanies"
            :server-items-length="pagination.itemsTotalCount"
            :sort-by.sync="pagination.sortBy"
            :sort-desc.sync="pagination.sortDesc"
            class="elevation-1"
            must-sort
            hide-default-footer>
                <template v-slot:[`item.logo`]="{ item }">
                    <v-avatar 
                        tile
                        size="28">
                            <v-img :src="item.logo.src" />
                    </v-avatar>
                </template>
                <template v-slot:[`item.plan`]="{ item }">
                    {{ item.plan.name }}
                </template>
                <template v-slot:[`item.createdAt`]="{ item }">
                    {{ formatDate(item.createdAt, 'verbose') }}
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon 
                                v-bind="attrs"
                                v-on="on"
                                color="secondary" 
                                @click="showViewedCompany(item)">
                                    <v-icon small>mdi-unfold-more-horizontal</v-icon>
                            </v-btn>
                        </template>
                        <span>Expand Details</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon 
                                v-bind="attrs"
                                v-on="on"
                                :color="item.blockedAt ? 'green' : 'red'" 
                                :loading="isTogglingCompaniesBlock[item.id]"
                                @click="toggleCompanyBlock(item)">
                                    <v-icon small>mdi-cancel</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ item.blockedAt ? 'Unblock' : 'Block' }} Company</span>
                    </v-tooltip>
                </template>
                <template v-slot:top>
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
                                            @click="reloadCompanies()"
                                            :loading="isReloadingCompanies">
                                                <v-icon>mdi-refresh</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Reload</span>
                                </v-tooltip>
                                <div class="caption text-right">
                                    showing {{ companies.length }} of {{ pagination.itemsTotalCount }} results
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>
                <template v-slot:footer v-if="(pagination.itemsTotalCount > companies.length) && !isLoadingCompanies">
                    <div class="table-bottom px-6">
                        <v-row>
                            <v-col cols="12">
                                <div style="display:flex;justify-content:space-around;">
                                    <v-btn color="primary"
                                        text
                                        @click="loadMoreCompanies()">
                                            Load More ...
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>
        </v-data-table>

        <company-details-dialog v-if="viewedCompany"
            :isActive="isShowingViewedCompany" 
            :company="viewedCompany"
            @close="hideViewedCompany()"/>
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

    import CompanyDetailsDialog from '@/components/CompanyDetailsDialog';

    const init = {
        search: {
            field: {
                text: 'Name',
                value: '__name'
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
        components: { CompanyDetailsDialog },
        name: 'Companies',
        data() {
            return {
                headers: [
                    {
                        text: '',
                        value: 'logo',
                        sortable: false,
                    },
                    {
                        text: 'Name',
                        value: 'name',
                    },
                    {
                        text: 'Email',
                        value: 'email',
                    },
                    {
                        text: 'Phone Number',
                        value: 'phoneNumber',
                        sortable: false,
                    },
                    { 
                        text: 'Plan', 
                        value: 'plan',
                        sortable: false,
                    },
                    { 
                        text: 'Employees', 
                        value: 'employeesTotalCount',
                    },
                    {
                        text: 'Date Registered',
                        value: 'createdAt',
                    },
                    {
                        text: 'Actions',
                        value: 'actions',
                        align: 'center',
                        sortable: false,
                    }
                ],
                companies: [],
                pagination: cloneDeep(init.pagination),

                isLoadingCompanies: false,
                isReloadingCompanies: false,
                isTogglingCompaniesBlock: {},

                search: cloneDeep(init.search),

                viewedCompany: null,
                isShowingViewedCompany: false,
            };
        },
        computed: {
            query() {
                const { sortBy, sortDesc, limit } = this.pagination;
                const sortOrder = sortDesc ? 'desc' : 'asc';

                return firebase.firestore()
                                .collection(`companies`)
                                .orderBy(sortBy, sortOrder)
                                .limit(limit);
            },
            companiesTotalCount() {
                return this.$store.state.documentCounters.companies;
            },
        },
        watch: {
            query: {
                immediate: true,
                async handler() {
                    this.search = cloneDeep(init.search);

                    await this.loadCompanies();
                },
            },
            search: {
                deep: true,
                async handler(search) {
                    if (search.term) {
                        if (search.term.length > 3) {
                            await this.searchCompanies();
                        }
                    }
                    else {
                        await this.loadCompanies();
                    }
                },
            },
        },
        methods: {
            async reloadCompanies() {
                this.isReloadingCompanies = true;

                await this.loadCompanies();

                this.isReloadingCompanies = false;
            },
            async loadCompanies() {
                this.isLoadingCompanies = true;

                this.companies = await this.fetchCompanies(this.query);

                this.pagination.itemsTotalCount = this.companiesTotalCount;

                this.isLoadingCompanies = false;
            },
            async loadMoreCompanies() {
                this.isLoadingCompanies = true;

                const lastDocument = this.pagination.lastDocument;

                const query = this.query.startAfter(lastDocument);

                const newCompanies = await this.fetchComnewCompanies(query);

                this.companies = this.companies.concat(newCompanies);

                this.isLoadingCompanies = false;
            },
            searchCompanies: debounce(async function () {
                this.isLoadingCompanies = true;

                const searchTerm = Case.lower(this.search.term);
                const searchField = this.search.field.value;

                const query = firebase.firestore()
                                    .collection('companies')
                                    .orderBy(searchField)
                                    .startAt(searchTerm)
                                    .endAt(searchTerm + "\uf8ff");

                this.companies = await this.fetchCompanies(query);

                this.pagination.itemsTotalCount = this.companies.length;

                this.isLoadingCompanies = false;
            }, 300),
            async fetchCompanies(query) {
                return await query
                                .get()
                                .then(async querySnapshot => {
                                    this.pagination.lastDocument = querySnapshot.docs[querySnapshot.size - 1];

                                    const companies = [];

                                    querySnapshot.forEach(documentSnapshot => {
                                        const company = {
                                            id: documentSnapshot.id,
                                            ...documentSnapshot.data(),
                                        };

                                        companies.push(company);
                                    });

                                    await Promise.all(companies.map(async company => {
                                        if (company.plan.get) {
                                            company.plan = (await company.plan.get()).data();
                                        }

                                        return company;
                                    }));

                                    return companies;
                                });
            },
            formatDate(timestamp, format) {
                if (format === 'verbose') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm A");
                }
            },
            async toggleCompanyBlock(company) {
                this.$set(this.isTogglingCompaniesBlock, company.id, true);

                try {
                    if (company.blockedAt) {
                        const unblockCompany = firebase.functions()
                                                        .httpsCallable('unblockCompany');

                        await unblockCompany({ companyId: company.id });

                        this.$set(company, 'blockedAt', null);
                    } 
                    else {
                        const blockCompany = firebase.functions()
                                                    .httpsCallable('blockCompany');

                        await blockCompany({ companyId: company.id });

                        this.$set(company, 'blockedAt', new Date().valueOf());
                    }
                }
                catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }

                this.$set(this.isTogglingCompaniesBlock, company.id, false);
            },
            showViewedCompany(company) {
                this.viewedCompany = company;
                this.isShowingViewedCompany = true;
            },
            hideViewedCompany() {
                this.viewedCompany = null;
                this.isShowingViewedCompany = false;
            }
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