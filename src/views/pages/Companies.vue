<template>
    <v-sheet color="transparent" class="mx-lg-6">
        <v-toolbar
            dark
            rounded
            color="background"
            class="textured-background">
                <v-toolbar-title class="text-h5">
                    Companies
                </v-toolbar-title>
        </v-toolbar>
        <v-sheet color="transparent">
            <v-row>
                <v-col cols="12" md="2">
                    <v-card
                        light
                        outlined
                        color="white"
                        style="border: thin solid rgba(0, 0, 0, 0.12) !important">
                            <v-list class="py-0">
                                <template 
                                    v-for="(navItem, index) in navItems">
                                        <v-list-item :key="navItem.id"
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
                                        <v-divider :key="index"/>
                                </template>
                            </v-list>
                    </v-card>
                </v-col>
                <v-col cols="12" md="10">
                    <router-view/>
                </v-col>
            </v-row>
        </v-sheet>
    </v-sheet>
</template>

<script>
    export default {
        name: 'Companies',
        computed: {
            navItems() {
                return [
                    {
                        title: 'All Companies',
                        icon: 'mdi-format-list-bulleted',
                        to: '/companies',
                    },
                    {
                        title: 'Broadcast Email',
                        icon: 'mdi-email-outline',
                        to: '/companies/broadcast-email',
                    },
                ];
            }
        }
    };
</script>