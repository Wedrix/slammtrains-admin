<template>
    <v-dialog
        v-model="isActive" 
        fullscreen 
        hide-overlay 
        transition="dialog-bottom-transition">
            <v-card color="#f2f4f7">
                <v-toolbar 
                    dark 
                    color="background"
                    class="textured-background">
                        <v-btn icon dark @click="$emit('close')">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>Company Details</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="3">
                            <v-card 
                                outlined
                                elevation="1"
                                color="white"
                                width="100%">
                                    <v-sheet>
                                        <v-card-text class="d-flex flex-column align-center">
                                            <div class="pb-4">
                                                <v-avatar tile size="100" color="white">
                                                    <img :src="company.logo.src"/>
                                                </v-avatar>
                                            </div>
                                            <div class="text-h5 text-center primary--text">
                                                {{ company.name }}
                                            </div>
                                            <div>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn icon 
                                                            v-bind="attrs"
                                                            v-on="on"
                                                            :color="company.blockedAt ? 'green' : 'red'" 
                                                            :loading="isTogglingCompanyBlock"
                                                            @click="toggleCompanyBlock()">
                                                                <v-icon>mdi-cancel</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>{{ company.blockedAt ? 'Unblock' : 'Block' }} Company</span>
                                                </v-tooltip>
                                            </div>
                                        </v-card-text>
                                    </v-sheet>
                                    <v-divider/>
                                    <v-list class="pa-0">
                                        <v-list-item two-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Email</v-list-item-title>
                                                <v-list-item-subtitle>{{ company.email }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn 
                                                    icon
                                                    :href="`mailto:${company.email}`">
                                                    <v-icon color="secondary">mdi-email</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                        <v-divider/>
                                        <v-list-item two-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Phone Number</v-list-item-title>
                                                <v-list-item-subtitle>{{ company.phoneNumber }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn 
                                                    icon
                                                    :href="`tel:${company.phoneNumber}`">
                                                    <v-icon color="secondary">mdi-phone</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                        <v-divider/>
                                        <v-list-item two-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Staff Size</v-list-item-title>
                                                <v-list-item-subtitle>{{ company.size }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider v-if="company.industry"/>
                                        <v-list-item v-if="company.industry" two-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Industry</v-list-item-title>
                                                <v-list-item-subtitle>{{ company.industry }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider/>
                                        <v-list-item three-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Address</v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ company.address.addressLine1 }}, 
                                                    {{ company.address.addressLine2 }}, 
                                                    {{ company.address.city }}, 
                                                    {{ company.address.region }}, 
                                                    {{ company.address.country }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider v-if="company.postalAddress"/>
                                        <v-list-item v-if="company.postalAddress" two-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Postal Address</v-list-item-title>
                                                <v-list-item-subtitle>{{ company.postalAddress }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider/>
                                        <v-list-item three-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">HR</v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ company.hr.firstName }} {{ company.hr.lastName }}
                                                </v-list-item-subtitle>
                                                <v-list-item-subtitle>
                                                    {{ company.hr.email }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider/>
                                        <v-list-item two-line>
                                            <v-list-item-content>
                                                <v-list-item-title class="primary--text">Date Registered</v-list-item-title>
                                                <v-list-item-subtitle>{{ formatDate(company.createdAt, 'verbose') }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-card
                                outlined
                                elevation="1"
                                color="white"
                                class="pa-4 mb-4">
                                    <v-row>
                                        <v-col cols="6" class="primary--text d-flex flex-column justify-space-between">
                                            <div class="secondary--text text-h4">{{ company.employeesTotalCount }}</div>
                                            <div class="text-subtitle">Employee Total</div>
                                        </v-col>
                                        <v-col cols="6" class="d-flex justify-end">
                                            <v-icon color="primary" size="55">mdi-account-group</v-icon>
                                        </v-col>
                                    </v-row>
                            </v-card>
                            <v-card
                                outlined
                                elevation="1"
                                color="white"
                                class="pa-4 mb-4">
                                    <v-row>
                                        <v-col cols="6" class="primary--text d-flex flex-column justify-space-between">
                                            <template 
                                                v-for="(revenue, index) in company.revenues">
                                                    <div :class="{ 'pb-2': index > 0 }" class="secondary--text text-h4"
                                                        :key="revenue.currency">
                                                            <span class="font-weight-bold pr-2">{{ revenue.currency }}</span>
                                                            <span>{{ revenue.amount / 100 }}</span>
                                                    </div>
                                            </template>
                                            <div v-if="company.revenues.length === 0" class="text--secondary font-italic pb-2">No revenue yet</div>
                                            <div class="text-subtitle">Revenue Totals</div>
                                        </v-col>
                                        <v-col cols="6" class="d-flex justify-end">
                                            <v-icon color="primary" size="55">mdi-cash-multiple</v-icon>
                                        </v-col>
                                    </v-row>
                            </v-card>
                            <v-card
                                outlined
                                elevation="1"
                                color="white"
                                class="pa-4 mb-4">
                                    <v-card-title class="pa-0 pb-1 primary--text">{{ company.plan.name }}</v-card-title>

                                    <v-card-text
                                        class="pa-0">
                                            <div class="pb-2">
                                                <div class="d-flex">
                                                    <div class="pr-2">
                                                        <strong>{{ company.plan.licensedNumberOfEmployees }}</strong> Employee License(s),
                                                    </div>
                                                    <div>
                                                        <strong>{{ (company.plan.licensedNumberOfEmployees - company.employeesTotalCount) }}</strong> Remaining
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong>{{ Array.purify(company.plan.courses).length }}</strong> Licensed Course(s)
                                                </div>
                                            </div>
                                            <div>
                                                <div 
                                                    v-for="course in Array.purify(company.plan.courses)" 
                                                    :key="course.id">
                                                        <v-icon small color="secondary">mdi-check</v-icon>
                                                        {{ course.name }}
                                                </div>
                                            </div>
                                    </v-card-text>

                                    <v-divider class="my-3"/>

                                    <div class="pb-3 primary--text">
                                        <div v-if="company.plan.billing">
                                            <span class="text-h4">{{ company.plan.billing.currency }} {{ company.plan.billing.price }}</span>
                                            <span class="text--secondary"> / {{ company.plan.billing.interval }}</span>
                                        </div>
                                        <div v-else>
                                            <span class="text-h4">FREE</span>
                                        </div>
                                    </div>
                            </v-card>
                            <v-card
                                outlined
                                elevation="1"
                                color="white"
                                class="pa-4 mb-4">
                                    <template v-if="company.subscription">
                                        <v-card-title class="pa-0 pb-1 primary--text">Subscription</v-card-title>
                                        <v-card-text class="pa-0">
                                            <div class="pb-2">
                                                <span class="primary--text text-decoration-underline font-weight-medium">Status</span>: 
                                                <span class="font-weight-medium"
                                                    :class="{
                                                            'green--text text--darken-2': company.subscription.status === 'Active',
                                                            'red--text text--darken-2': company.subscription.status === 'Inactive'}">
                                                        {{ company.subscription.status }}
                                                </span>
                                            </div>
                                            <div class="pb-2">
                                                <span class="primary--text text-decoration-underline font-weight-medium">Subscribed on</span>:
                                                <span>{{ formatDate(company.subscription.createdAt, 'verbose') }}</span>
                                            </div>
                                            <div class="pb-2">
                                                <span class="primary--text text-decoration-underline font-weight-medium">
                                                    {{ { 'Active': 'Expires', 'Inactive': 'Expired'}[company.subscription.status] }} on</span>:
                                                <span>{{ formatDate(company.subscription.expiresAt, 'verbose') }}</span>
                                            </div>
                                        </v-card-text>
                                    </template>
                                    <template v-else>
                                        <v-card-text class="text-center font-italic">Unsubscribed</v-card-text>
                                    </template>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-toolbar 
                                flat
                                outlined
                                class="rounded-t">
                                    <v-toolbar-title class="primary--text">Transactions</v-toolbar-title>
                            </v-toolbar>
                            <v-data-table
                                :headers="headers"
                                :items="transactions"
                                :loading="isLoadingTransactions"
                                :server-items-length="transactionsTotalCount"
                                :options.sync="pagination"
                                class="elevation-1"
                                disable-sort>
                                    <template v-slot:[`item.amount`]="{ item }">
                                        <span class="font-weight-bold">
                                            {{ item.currency }}
                                            {{ item.amount / 100 }}
                                        </span>
                                    </template>
                                    <template v-slot:[`item.status`]="{ item }">
                                        <span 
                                            class="font-weight-medium" 
                                            :class="{ 
                                                    'green--text text--darken-2': item.status === 'success',
                                                    'purple--text text--darken-2': item.status === 'abandoned',
                                                    'red--text text--darken-2': item.status === 'failed',
                                                }">
                                                {{ item.status }}
                                        </span>
                                    </template>
                                    <template v-slot:[`item.channel`]="{ item }">
                                        {{ item.channel | inLowerCase }}
                                    </template>
                                    <template v-slot:[`item.createdAt`]="{ item }">
                                        {{ formatDate(item.createdAt, 'verbose') }}
                                    </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
    </v-dialog>
</template>


<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import moment from 'moment';
    import Case from 'case';

    export default {
        name: 'CompanyDetails',
        props: ['isActive', 'company'],
        data() {
            return {
                headers: [
                    {
                        text: 'ID',
                        value: 'id',
                    },
                    {
                        text: 'Reference',
                        value: 'reference',
                    },
                    {
                        text: 'Amount',
                        value: 'amount',
                    },
                    { 
                        text: 'Status', 
                        value: 'status',
                    },
                    { 
                        text: 'Channel', 
                        value: 'channel',
                    },
                    {
                        text: 'Created At',
                        value: 'createdAt',
                    },
                ],
                transactions: [],
                pagination: {
                    page: 1,
                    itemsPerPage: 10,
                },
                transactionsTotalCount: 0,

                isLoadingTransactions: false,
                isTogglingCompanyBlock: false,
            };
        },
        watch: {
            pagination: {
                deep: true,
                async handler() {
                    await this.loadTransactions();
                }
            },
            isActive: {
                immediate: true,
                async handler() {
                    await this.loadTransactions();
                }
            },
            company: {
                immediate: true,
                handler(company) {
                    // Resolve Subscription Status
                        if (company.subscription) {
                            company.subscription.status = moment(company.subscription.expiresAt).isAfter(moment()) ? 'Active' : 'Inactive';
                        }

                    // Resolve Revenues
                        const revenues = [];

                        for (const currency in company.revenue) {
                            const revenue = {
                                currency: currency,
                                amount: company.revenue[currency],
                            };

                            revenues.push(revenue);
                        }

                        company.revenues = revenues;

                    // Resolve Plan Courses
                    if (company?.plan?.courses) {
                        company.plan.courses.forEach(async (course, index) => {
                            if (course.get) {
                                company.plan.courses[index] = (await course.get()).data();
                            }
                        });
                    }
                }
            }
        },
        methods: {
            async loadTransactions() {
                this.isLoadingTransactions = true;

                try {
                    const fetchCompanyTransactions = firebase.functions()
                                                            .httpsCallable('fetchCompanyTransactions');

                    const transactionsPaginationData = {
                        companyId: this.company.id,
                        perPage: this.pagination.itemsPerPage,
                        page: this.pagination.page,
                    };

                    const transactionsData = (await fetchCompanyTransactions({ transactionsPaginationData })).data;

                    this.transactions = transactionsData.data;
                    this.transactionsTotalCount = transactionsData.meta.total;
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isLoadingTransactions = false;
            },
            formatDate(timestamp, format) {
                if (format === 'verbose') {
                    return moment(timestamp).format("MMMM Do, YYYY h:mm A");
                }
            },
            async toggleCompanyBlock() {
                this.isTogglingCompanyBlock = true;

                try {
                    if (this.company.blockedAt) {
                        const unblockCompany = firebase.functions()
                                                        .httpsCallable('unblockCompany');

                        await unblockCompany({ companyId: this.company.id });

                        this.$set(this.company, 'blockedAt', null);
                    } 
                    else {
                        const blockCompany = firebase.functions()
                                                    .httpsCallable('blockCompany');

                        await blockCompany({ companyId: this.company.id });

                        this.$set(this.company, 'blockedAt', new Date().valueOf());
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

                this.isTogglingCompanyBlock = false;
            },
        },
        filters: {
            inLowerCase(string) {
                return Case.lower(string);
            }
        }
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