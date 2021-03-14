<template>
    <v-card>
        <v-form @submit.prevent="sendBroadcastEmail()" ref="broadcastEmailForm">
            <v-card-title>
                <span class="headline primary--text">New Broadcast Email</span>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="broadcastEmail.subject"
                            label="Subject" 
                            :rules="[required]"
                            required/>
                    </v-col>
                    <v-col cols="12">
                        <v-input
                            v-model="broadcastEmail.body"
                            :rules="[required]"
                            required>
                                <quill-editor 
                                    v-model="broadcastEmail.body"
                                    :options="quillConfig"
                                    style="width:100%"/>
                        </v-input>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn color="primary" type="submit" dark :loading="isSendingBroadcastEmail">Send Email</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import validators from '@/mixins/validators';

    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';

    import { quillEditor } from 'vue-quill-editor';
    
    import { cloneDeep } from 'lodash';

    const init = {
        broadcastEmail: {
            subject: '',
            body: '',
        }
    };

    export default {
        name: 'BroadcastEmail',
        mixins: [validators],
        components: {
            'quill-editor': quillEditor,
        },
        data() {
            return {
                quillConfig: {
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],

                            [{ 'align' : null },{ 'align': 'right' },{ 'align': 'center' },{ 'align': 'justify' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],

                            [{ 'color': [] }, { 'background': [] }],

                            ['blockquote','link'],

                            ['image','video'],

                            ['clean'],
                        ]
                    },
                    placeholder: '',
                },
                broadcastEmail: cloneDeep(init.broadcastEmail),
                isSendingBroadcastEmail: false,
            };
        },
        methods: {
            async sendBroadcastEmail() {
                if (!this.$refs.broadcastEmailForm.validate()) {
                    return;
                }

                this.isSendingBroadcastEmail = true;

                try {
                    const emailData = cloneDeep(this.broadcastEmail);

                    const broadcastEmail = firebase.functions()
                                                    .httpsCallable('broadcastEmail');

                    await broadcastEmail({ emailData });

                    this.broadcastEmail = cloneDeep(init.broadcastEmail);
                    this.$refs.broadcastEmailForm.resetValidation();
                    this.$router.push('/companies');
                } catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }

                this.isSendingBroadcastEmail = false;
            },
        }
    };
</script>