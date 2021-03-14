<template>
    <slim 
        :options="options"
        :key="refreshKey" :initial-image="image.src">
            <input type="file" name="image" ref="image"/>
    </slim>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/storage';
    import { v4 as uuidv4 } from 'uuid';

    import Slim from '@/components/Slim.vue';

    import { cloneDeep } from 'lodash';

    const init = {
        image: {
            src: '',
            fileName: '',
            fullPath: ''
        },
    };
        
    const match = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
    };

    export default {
        name: 'ImagePickerComponent',
        components: {
            'slim': Slim,
        },
        props: {
            directory: {
                type: String,
                default: 'images',
            },
            label: {
                type: String,
                default: 'image'
            },
            aspectRatio: {
                type: String,
                default: '1:1'
            },
            initialImage: {
                type: Object,
                default: cloneDeep(init.image),
            }
        },
        data() {
            return {
                image: cloneDeep(init.image),

                options: {
                    ratio: this.aspectRatio,
                    label: this.label,
                    service: (files,progress,success,failure) => {
                        this.$emit('uploading-image');

                        const file = files[0];
                        const ref = `${this.directory}/${uuidv4()}_${file.name}`;
                        const storageRef = firebase.storage().ref();

                        const metadata = {
                            contentType: file.type,
                        };

                        const uploadTask = storageRef.child(ref).put(file, metadata);
                        
                        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snapshot => {
                            progress(snapshot.bytesTransferred,snapshot.totalBytes);
                        }, error => {
                            failure(error);

                            this.$emit('error-uploading-image');
                        }, async () => {
                            const src = await uploadTask.snapshot.ref.getDownloadURL();

                            const image = {
                                fileName: file.name,
                                fullPath: ref,
                                src,
                            };

                            this.image = image;

                            success('Upload Completed');

                            this.refreshKey++;

                            this.$emit('image-upload-successful', image);
                        });
                    },
                    didRemove: removedImage => {
                        this.$emit('deleting-image');

                        const storageRef = firebase.storage().ref();

                        storageRef.child(this.image.fullPath)
                                .delete()
                                .catch(error => {
                                    this.$emit('error-deleting-image');

                                    const notification = {
                                        message: error.message,
                                        context: 'error',
                                    };

                                    this.$store.commit('push_notification', { notification });
                                });

                        const image = cloneDeep(init.image);

                        this.$emit('image-deletion-successful', image);

                        this.image = image;
                    },
                    serviceFormat: 'file',
                    instantEdit: true,
                    push: true,    
                },

                refreshKey: 0,
            };
        },
        watch: {
            'initialImage': {
                immediate: true,
                handler(initialImage) {
                    if (!match(initialImage, this.image)) {
                        this.image = cloneDeep(initialImage);
                    }
                }
            }
        }
    };
</script>