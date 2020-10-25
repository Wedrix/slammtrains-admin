<template>
    <v-app>
        <v-navigation-drawer
            v-model="isShowingNavDrawer"
            app
            clipped>
                <v-list>
                    <v-list-item 
                        v-for="navItem in navItems" 
                        :key="navItem.title" 
                        :to="navItem.to"
                        color="primary"
                        link
                        exact>
                            <v-list-item-icon>
                                <v-icon>{{ navItem.icon }}</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>{{ navItem.title }}</v-list-item-title>
                            </v-list-item-content>
                    </v-list-item>
                </v-list>

                <template v-slot:append>
                    <v-list>
                        <v-divider/>
                        
                        <v-list-item @click="logout()">
                            <v-list-item-icon>
                                <v-icon>mdi-logout</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>LOGOUT</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </template>
        </v-navigation-drawer>

        <v-app-bar app flat clipped-left color="white" style="border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
            <v-app-bar-nav-icon class="mr-6" :class="{ 'd-none': isShowingNavDrawer }"
                @click="isShowingNavDrawer = !isShowingNavDrawer"/>
    
            <v-avatar tile width="145" color="white">
                <img src="@/assets/logo.png"/>
            </v-avatar>

            <v-spacer/>

            <v-btn icon>
                <v-icon>mdi-bell</v-icon>
            </v-btn>

            <v-menu left bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn class="ml-2" color="secondary" fab :elevation="0" small v-bind="attrs" v-on="on">
                        {{ getInitials(admin.name) }}
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-account-circle</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>Account</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-divider/>

                    <v-list-item>
                        <v-btn @click="logout()" color="secondary" small block>
                            <v-icon>mdi-logout</v-icon> LOGOUT
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="plain-background">
            <v-container fluid>
                <router-view/>
            </v-container>

            <notification/>
        </v-main>

        <v-footer app inset color="white" flat style="border-top: thin solid rgba(0, 0, 0, 0.12) !important;">
            <div class="text-caption">&#169;2020 Slamm Technologies</div>
        </v-footer>
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    import Notification from '@/components/Notification.vue';

    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'DashboardLayout',
        components: {
            'notification': Notification,
        },
        data() {
            return {
                navItems: [
                    {
                        title: 'Home',
                        icon: 'mdi-home-variant-outline',
                        to: '/',
                    },
                    {
                        title: 'Companies',
                        icon: 'mdi-domain',
                        to: '/companies',
                    },
                    {
                        title: 'Courses',
                        icon: 'mdi-book-open-outline',
                        to: '/courses',
                    },
                    {
                        title: 'Plans',
                        icon: 'mdi-wallet-outline',
                        to: '/plans',
                    },
                    {
                        title: 'Settings',
                        icon: 'mdi-cog-outline',
                        to: '/settings',
                    }
                ],
                
                isShowingNavDrawer: null,
            };
        },
        computed: {
            ...mapState([
                'admin',
            ]),
        },
        methods: {
            async logout() {
                try {
                    await firebase.auth().signOut();
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }
            },
            getInitials(name) {
                const names = name.split(' ');

                let initials = `${names[0].charAt(0)}`;

                if (names[names.length - 1]) {
                    initials = initials + `${names[names.length - 1].charAt(0)}`;
                }

                return initials;
            }
        },
        created() {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    this.$store.dispatch('initialize', { user });
                } else {
                    this.$store.dispatch('clear');
                }
            });
        }
    }
</script>

<style lang="scss">
    .textured-background {
        background-image: url('../../assets/background.png');
        background-repeat: repeat;
    }
    .plain-background {
        background-color: #32527910 !important;
    }
</style>

<style scoped>
    .v-list {
        padding: 0;
    }
</style>