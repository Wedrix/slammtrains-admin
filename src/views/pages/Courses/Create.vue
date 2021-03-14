<template>
    <v-form ref="addCourseForm" @submit.prevent="validateCreateCourseForm() && addCourse()">
        <v-sheet color="transparent">
            <v-stepper v-model="step" vertical>
                <v-stepper-header style="box-shadow:none;">
                    <v-toolbar
                        flat
                        rounded
                        color="white">
                            <v-toolbar-title class="headline primary--text">
                                New Course
                            </v-toolbar-title>
                            <v-spacer/>
                            <v-btn 
                                color="primary" 
                                class="mr-4" 
                                @click="saveDraft()" 
                                :loading="isSavigDraft"
                                :disabled="!dataEntered" 
                                outlined>
                                    {{ this.draftId ? 'Save Draft' : 'Save As Draft'}}
                            </v-btn>
                            <v-btn 
                                color="secondary" 
                                class="mr-4" 
                                type="submit" 
                                :loading="isAddingCourse">
                                    Create Course
                            </v-btn>
                    </v-toolbar>
                </v-stepper-header>

                <v-divider/>

                <v-stepper-step 
                    :complete="step > 1" 
                    :editable="true"
                    step="1"
                    color="secondary">
                        <div class="text-h6">Basic Information</div>
                        <small>Basic information about the course</small>
                        <small class="red--text d-block pt-2"
                            v-if="newCourseValidationErrors.basicInformation">
                                {{ newCourseValidationErrors.basicInformation }}
                        </small>
                </v-stepper-step>

                <v-stepper-content 
                    step="1">
                        <v-row>
                            <v-col cols="12" md="7">
                                <v-text-field 
                                    v-model="newCourse.name"
                                    label="Name"
                                    :rules="[required]" 
                                    required/>

                                <v-textarea
                                    v-model="newCourse.overview"
                                    label="Overview"
                                    rows="3"
                                    :rules="[required]"
                                    required/>

                                <v-textarea
                                    v-model="newCourse.description"
                                    label="Description"
                                    rows="5"
                                    :rules="[required]"
                                    required/>
                            </v-col>
                            <v-col md="1"/>
                            <v-col cols="12" md="4">
                                <v-input
                                    v-model="newCourse.thumbnail"
                                    :rules="[required]"
                                    required
                                    class="block-input">
                                        <image-picker style="height:100%;width:100%;"
                                            directory="courses/thumbnails" 
                                            label="Course Thumbnail"
                                            aspect-ratio="3:2"
                                            :initial-image="newCourse.thumbnail"
                                            @uploading-image="isUploadingImage = true;"
                                            @error-uploading-image="isUploadingImage = false;"
                                            @image-upload-successful="newCourse.thumbnail = $event; isUploadingImage = false;"
                                            @image-deletion-successful="newCourse.thumbnail = $event;"/>
                                </v-input>
                            </v-col>
                        </v-row>
                </v-stepper-content>

                <v-stepper-step 
                    :complete="step > 2" 
                    :editable="true"
                    step="2"
                    color="secondary">
                        <div class="text-h6">Modules</div>
                        <small>Create the course modules with lessons</small>
                        <small class="red--text d-block pt-2"
                            v-if="newCourseValidationErrors.modules">
                                {{ newCourseValidationErrors.modules }}
                        </small>
                </v-stepper-step>

                <v-stepper-content step="2">
                    <v-row>
                        <v-col 
                            cols="12"
                            md="4"
                            v-if="newCourse.modules.length > 0">
                                <draggable 
                                    v-model="newCourse.modules" 
                                    group="modules">
                                        <v-card 
                                            dark
                                            outlined
                                            elevation="1"
                                            color="primary"
                                            class="pt-2 mb-2"
                                            v-for="(courseModule, index) in newCourse.modules"
                                            :key="`module-${index}`">
                                                <div class="d-flex justify-space-between">
                                                    <div class="pa-2">
                                                        <div class="text-body-1">
                                                            <span>{{ courseModule.name }}</span>
                                                        </div>
                                                        <div 
                                                            v-if="courseModule.canBePreviewed">
                                                                <v-chip 
                                                                    class="label mt-2 mr-3"
                                                                    color="white"
                                                                    text-color="secondary"
                                                                    label
                                                                    small>
                                                                        <strong>Previewable</strong>
                                                                </v-chip>
                                                        </div>
                                                    </div>
                                                    <div class="pa-2">
                                                        <v-tooltip top>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn icon 
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                                    color="white"
                                                                    @click="editModule(courseModule)">
                                                                        <v-icon>mdi-pencil</v-icon>
                                                                </v-btn>
                                                            </template>
                                                            <span>Edit</span>
                                                        </v-tooltip>
                                                        <v-tooltip top>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn icon 
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                                    color="white"
                                                                    @click="removeModule(courseModule)">
                                                                        <v-icon>mdi-close</v-icon>
                                                                </v-btn>
                                                            </template>
                                                            <span>Remove</span>
                                                        </v-tooltip>
                                                    </div>
                                                </div>
                                                <v-divider/>
                                                <v-list 
                                                    dense 
                                                    light>
                                                        <template v-for="(lesson, index) in courseModule.lessons">
                                                            <v-list-item :key="`lesson-${index}`">
                                                                <v-list-item-icon>
                                                                    <v-icon 
                                                                        small
                                                                        color="primary">
                                                                            {{ lessonContentIcons[lesson.contentType] }}
                                                                    </v-icon>
                                                                </v-list-item-icon>
                                                                <v-list-item-content>
                                                                    <v-list-item-title 
                                                                        class="primary--text">
                                                                            {{ lesson.title }}
                                                                    </v-list-item-title>
                                                                </v-list-item-content>
                                                                <v-list-item-action>
                                                                    <v-list-item-action-text 
                                                                        class="primary--text">
                                                                            {{ lesson.durationInSeconds | toTimer }}
                                                                    </v-list-item-action-text>
                                                                </v-list-item-action>
                                                            </v-list-item>
                                                            <v-divider 
                                                                :key="`lesson-divider-${index}`"
                                                                v-if="index !== (courseModule.lessons.length - 1)"/>
                                                        </template>
                                                </v-list>
                                        </v-card>
                                </draggable>
                        </v-col>
                        <v-col cols="12" md="8">
                            <v-form
                                ref="addModuleForm" 
                                @submit.prevent="validateAddModuleForm() && addModule()">
                                    <v-expansion-panels 
                                        :value="[1,2]"
                                        multiple
                                        flat 
                                        focusable  
                                        active-class="active-panel"
                                        style="border: thin solid rgba(0, 0, 0, 0.12)">
                                            <v-expansion-panel disabled>
                                                <v-expansion-panel-header hide-actions color="primary">
                                                    <div class="text-h6 white--text">New Module</div>
                                                </v-expansion-panel-header>
                                            </v-expansion-panel>
                                            <v-expansion-panel> 
                                                <v-expansion-panel-header hide-actions>
                                                    <div>
                                                        <div class="text-h6">Basic Information</div>
                                                        <small>Basic Information about the module</small>
                                                    </div>
                                                </v-expansion-panel-header>
                                                <v-expansion-panel-content>
                                                    <v-row>
                                                        <v-col cols="12">
                                                            <v-text-field 
                                                                v-model="newModule.name"
                                                                label="Name"
                                                                :rules="[required]" 
                                                                required/>
                                                        </v-col>
                                                        <v-col cols="12">
                                                            <v-checkbox
                                                                v-model="newModule.canBePreviewed"
                                                                label="Can Be Previewed"/>
                                                        </v-col>
                                                    </v-row>
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                            <v-expansion-panel>
                                                <v-expansion-panel-header hide-actions>
                                                    <div>
                                                        <div class="text-h6">Lessons</div>
                                                        <small class="d-block">Add lessons as video, text or questions</small>
                                                        <small class="red--text d-block pt-2"  
                                                            v-if="newModuleValidationErrors.lessons">
                                                                {{ newModuleValidationErrors.lessons }}
                                                        </small>
                                                    </div>
                                                </v-expansion-panel-header>
                                                <v-expansion-panel-content>
                                                    <draggable 
                                                        v-if="newModule.lessons.length > 0"
                                                        v-model="newModule.lessons" 
                                                        group="lessons"
                                                        class="row">
                                                            <v-col 
                                                                cols="12" 
                                                                md="4"
                                                                v-for="(lesson, index) in newModule.lessons"
                                                                :key="`lesson-${index}`">
                                                                    <v-sheet
                                                                        dark
                                                                        rounded
                                                                        color="primary"
                                                                        class="px-4 py-2"
                                                                        style="position:relative;">
                                                                            <v-row>
                                                                                <v-col cols="2">
                                                                                    {{ index + 1 }}.
                                                                                </v-col>
                                                                                <v-col cols="10">
                                                                                    {{ lesson.title }}
                                                                                </v-col>
                                                                            </v-row>
                                                                            <v-divider/>
                                                                            <div class="pt-2">
                                                                                <v-btn 
                                                                                    icon
                                                                                    color="white"
                                                                                    class="pr-4"
                                                                                    @click="editLesson(lesson)">
                                                                                        <v-icon>mdi-pencil</v-icon>
                                                                                </v-btn>
                                                                                <v-btn 
                                                                                    icon
                                                                                    color="white"
                                                                                    @click="removeLesson(lesson)">
                                                                                        <v-icon>mdi-delete</v-icon>
                                                                                </v-btn>
                                                                            </div>
                                                                    </v-sheet>
                                                            </v-col>
                                                    </draggable>
                                                    <v-divider class="my-2" v-if="newModule.lessons.length > 0"/>
                                                    <v-card
                                                        outlined
                                                        elevation="2"
                                                        color="white"
                                                        class="mt-4">
                                                            <v-form 
                                                                ref="addLessonForm" 
                                                                class="pa-4"
                                                                @submit.prevent="validateAddLessonForm() && addLesson()">
                                                                    <v-card-title class="text-h6 primary--text">New Lesson</v-card-title>
                                                                    <v-card-text>
                                                                        <v-text-field 
                                                                            v-model="newLesson.title"
                                                                            label="Title"
                                                                            :rules="[required]" 
                                                                            required/>

                                                                        <v-select 
                                                                            v-model="newLesson.contentType" 
                                                                            label="Content Type" 
                                                                            :items="[
                                                                                {
                                                                                    text: 'Text',
                                                                                    value: 'html',
                                                                                },
                                                                                {
                                                                                    text: 'Video',
                                                                                    value: 'video',
                                                                                },
                                                                                {
                                                                                    text: 'Questions',
                                                                                    value: 'questions',
                                                                                }
                                                                            ]"/>

                                                                        <template v-if="newLesson.contentType === 'video'">
                                                                            <video v-if="newLesson.content.video.blobUrl"
                                                                                :src="newLesson.content.video.blobUrl"
                                                                                ref="video"
                                                                                width="100%"
                                                                                muted 
                                                                                autoplay 
                                                                                loop/>

                                                                            <canvas 
                                                                                class="d-none" 
                                                                                ref="videoThumbnail"/>

                                                                            <v-file-input
                                                                                v-model="newLesson.content.video.file"
                                                                                label="Video"
                                                                                accept="video/*"
                                                                                :rules="[required]"
                                                                                required/>
                                                                        </template>

                                                                        <template v-if="newLesson.contentType === 'html'">
                                                                            <v-input
                                                                                v-model="newLesson.content.html"
                                                                                :rules="[required]"
                                                                                required>
                                                                                    <quill-editor 
                                                                                        v-model="newLesson.content.html"
                                                                                        :options="quillConfig"
                                                                                        style="width:100%"/>
                                                                            </v-input>
                                                                        </template>

                                                                        <template v-if="newLesson.contentType === 'questions'">
                                                                            <draggable 
                                                                                v-if="newLesson.content.questions.length > 0"
                                                                                v-model="newLesson.content.questions" 
                                                                                group="questions"
                                                                                class="row">
                                                                                    <v-col 
                                                                                        cols="12" 
                                                                                        md="4"
                                                                                        v-for="(question, index) in newLesson.content.questions"
                                                                                        :key="`question-${index}`">
                                                                                            <v-sheet
                                                                                                dark
                                                                                                rounded
                                                                                                color="primary"
                                                                                                class="px-4 py-2"
                                                                                                style="position:relative;">
                                                                                                    <v-row>
                                                                                                        <v-col cols="2">
                                                                                                            {{ index + 1 }}.
                                                                                                        </v-col>
                                                                                                        <v-col cols="10">
                                                                                                            {{ question.question }}
                                                                                                        </v-col>
                                                                                                    </v-row>
                                                                                                    <v-divider/>
                                                                                                    <div class="pt-2">
                                                                                                        <v-btn 
                                                                                                            icon
                                                                                                            color="white"
                                                                                                            class="pr-4"
                                                                                                            @click="editQuestion(question)">
                                                                                                                <v-icon>mdi-pencil</v-icon>
                                                                                                        </v-btn>
                                                                                                        <v-btn 
                                                                                                            icon
                                                                                                            color="white"
                                                                                                            @click="removeQuestion(question)">
                                                                                                                <v-icon>mdi-delete</v-icon>
                                                                                                        </v-btn>
                                                                                                    </div>
                                                                                            </v-sheet>
                                                                                    </v-col>
                                                                                    <v-col slot="footer"
                                                                                        v-if="!isShowingAddQuestionForm"
                                                                                        cols="12" 
                                                                                        md="2"
                                                                                        class="d-flex"
                                                                                        style="align-items:center;justify-content:center;">
                                                                                            <v-btn 
                                                                                                fab
                                                                                                color="secondary"
                                                                                                x-large
                                                                                                @click="isShowingAddQuestionForm = true;">
                                                                                                    <v-icon>mdi-plus</v-icon>
                                                                                            </v-btn>
                                                                                    </v-col>
                                                                            </draggable>

                                                                            <template v-if="isShowingAddQuestionForm">
                                                                                <v-divider class="my-2" v-if="newLesson.content.questions.length > 0"/>
                                                                                <v-card outlined>
                                                                                    <v-form
                                                                                        ref="addQuestionForm" 
                                                                                        class="pa-4"
                                                                                        @submit.prevent="validateAddQuestionForm() && addQuestion()">
                                                                                            <v-row>
                                                                                                <v-col cols="12" class="d-flex">
                                                                                                    <div class="text-h6 primary--text">New Question</div>
                                                                                                    <v-spacer/>
                                                                                                    <v-btn  
                                                                                                        icon
                                                                                                        @click="isShowingAddQuestionForm = false;"  
                                                                                                        :disabled="newLesson.content.questions.length < 1">
                                                                                                            <v-icon color="primary">mdi-close</v-icon>
                                                                                                    </v-btn>
                                                                                                </v-col>
                                                                                                <v-col cols="12">
                                                                                                    <v-text-field 
                                                                                                        v-model="newQuestion.question"
                                                                                                        label="Question"
                                                                                                        :rules="[required]" 
                                                                                                        required/>
                                                                                                </v-col>
                                                                                                <v-col cols="12">
                                                                                                    <ol type="A">
                                                                                                        <li v-for="(option,index) in newQuestion.options" :key="`option-${index}`">
                                                                                                            <v-text-field 
                                                                                                                :label="`Option ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[index]}`"
                                                                                                                v-model="newQuestion.options[index]" 
                                                                                                                :append-icon="(index > 0) ? 'mdi-close' : undefined" 
                                                                                                                @click:append="removeNewQuestionOption(index)"/>
                                                                                                        </li>
                                                                                                    </ol>
                                                                                                    <div class="pt-2 pl-5">
                                                                                                        <v-btn 
                                                                                                            small
                                                                                                            outlined
                                                                                                            color="primary"
                                                                                                            @click="addNewQuestionOption()">
                                                                                                                <v-icon small>mdi-plus</v-icon> New Option
                                                                                                        </v-btn>
                                                                                                    </div>
                                                                                                </v-col>
                                                                                                <v-col cols="12">
                                                                                                    <v-select 
                                                                                                        multiple
                                                                                                        :items="newQuestion.options" 
                                                                                                        label="Answers" 
                                                                                                        v-model="newQuestion.answers"/>
                                                                                                </v-col>
                                                                                                <v-col cols="12">
                                                                                                    <v-textarea
                                                                                                        v-model="newQuestion.explanation"
                                                                                                        label="Explanation"
                                                                                                        rows="4"
                                                                                                        auto-grow
                                                                                                        :rules="[required]"
                                                                                                        required/>
                                                                                                </v-col>
                                                                                                <v-col cols="6" md="7">
                                                                                                    <v-text-field
                                                                                                        v-model.number="newQuestion.durationInSeconds"
                                                                                                        label="Duration (seconds)"
                                                                                                        type="number"
                                                                                                        :rules="[required, min(1)]"
                                                                                                        required/>
                                                                                                </v-col>
                                                                                                <v-col cols="12">
                                                                                                    <v-btn 
                                                                                                        outlined
                                                                                                        type="submit" 
                                                                                                        color="primary" 
                                                                                                        :loading="isAddingQuestion">
                                                                                                            Add Question
                                                                                                    </v-btn>
                                                                                                </v-col>
                                                                                            </v-row>
                                                                                    </v-form>
                                                                                </v-card>
                                                                            </template>
                                                                        </template>

                                                                        <v-text-field
                                                                            v-model.number="newLesson.durationInSeconds"
                                                                            label="Duration (seconds)"
                                                                            type="number"
                                                                            :rules="newLesson.contentType === 'video' 
                                                                                ? [required, min(1), max(newLesson.content.video.durationInSeconds)]
                                                                                : [required, min(1)]"
                                                                            required
                                                                            :disabled="newLesson.contentType === 'questions'"/>
                                                                    </v-card-text>
                                                                    <v-card-actions>
                                                                        <v-btn 
                                                                            block
                                                                            large
                                                                            rounded
                                                                            depressed
                                                                            type="submit" 
                                                                            color="secondary" 
                                                                            :loading="isAddingLesson">
                                                                                Add Lesson
                                                                        </v-btn>
                                                                    </v-card-actions>
                                                            </v-form>
                                                    </v-card>
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                            <v-expansion-panel readonly>
                                                <v-expansion-panel-header 
                                                    hide-actions 
                                                    color="white">
                                                        <v-sheet color="white" dark>
                                                            <div class="d-flex">
                                                                <v-spacer/>
                                                                <v-btn 
                                                                    light
                                                                    large 
                                                                    color="primary"
                                                                    type="submit"
                                                                    :loading="isAddingModule">
                                                                        Create Module
                                                                </v-btn>
                                                            </div>
                                                        </v-sheet>
                                                </v-expansion-panel-header>
                                            </v-expansion-panel>
                                    </v-expansion-panels>
                            </v-form>
                        </v-col>
                    </v-row>
                </v-stepper-content>
            </v-stepper>
        </v-sheet>
    </v-form>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';
    import 'firebase/firestore';

    import validators from '@/mixins/validators';
    import ImagePickerComponent from '@/components/ImagePicker.vue';

    import { v4 as uuidv4 } from 'uuid';

    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';

    import { quillEditor } from 'vue-quill-editor';
    import draggable from 'vuedraggable';

    import { cloneDeep } from 'lodash';

    const init = {
        newCourse: {
            name: '',
            description: '',
            overview: '',
            thumbnail: {
                src: '',
                fileName: '',
                fullPath: '',
            },
            modules: [],
        },
        newModule: {
            name: '',
            lessons: [],
            canBePreviewed: false,
        },
        newLesson: {
            title: '',
            durationInSeconds: null,
            contentType: 'video',
            content: {
                video: {
                    blobUrl: '',
                    file: null,
                    thumbnail: {
                        file: null,
                    },
                    durationInSeconds: 0,
                },
                html: '',
                questions: [],
            }
        },
        newQuestion: {
            question: '',
            options: [''],
            answers: [],
            explanation: '',
            durationInSeconds: null,
        }
    };

    const match = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
    };

    const beforeUnloadListener = event => {
        event.preventDefault();

        return event.returnValue = "You have some unsaved changes. Are you sure you want to leave?";
    };

    export default {
        name: 'Courses',
        mixins: [validators],
        components: {
            'image-picker': ImagePickerComponent,
            'quill-editor': quillEditor,
            draggable,
        },
        data() {
            return {
                step: 1,
                newCourse: cloneDeep(init.newCourse),
                newLesson: cloneDeep(init.newLesson),
                newModule: cloneDeep(init.newModule),
                newQuestion: cloneDeep(init.newQuestion),
                isAddingLesson: false,
                isAddingCourse: false,
                isUploadingImage: false,
                isShowingAddQuestionForm: true,
                isAddingQuestion: false,
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
                },
                newModuleValidationErrors: {
                    lessons: '',
                },
                newCourseValidationErrors: {
                    basicInformation: '',
                    modules: '',
                },
                isAddingModule: false,
                lessonContentIcons: {
                    html: 'mdi-file-document',
                    video: 'mdi-video',
                    questions: 'mdi-help-circle',
                },
                draftId: null,
                isSavingDraft: false,
                draftSaved: false,
            };
        },
        computed: {
            dataEntered() {
                return !match(this.newCourse, init.newCourse);
            }
        },
        watch: {
            'newLesson.content.video.file': {
                handler(videoFile) {
                    if (videoFile) {
                        this.newLesson.content.video.blobUrl = URL.createObjectURL(videoFile);

                        this.$nextTick(() => {
                            const videoElement = this.$refs.video;

                            videoElement.onloadedmetadata = () => {
                                this.newLesson.content.video.durationInSeconds = Math.ceil(videoElement.duration);
                            };

                            videoElement.onplay = async () => {
                                this.newLesson.content.video.thumbnail.file = await this.createVideoThumbnail();
                            };
                        });
                    } else {
                        this.newLesson.content.video.blobUrl = '';
                    }
                }
            },
            dataEntered(dataEntered) {
                if (dataEntered) {
                    addEventListener('beforeunload', beforeUnloadListener, { capture: true });
                }
                else {
                    removeEventListener('beforeunload', beforeUnloadListener, { capture: true });
                }
            },
        },
        methods: {
            validateCreateCourseForm() {
                if (this.isUploadingImage) {
                    this.alert = {
                        message: 'Kindly wait for the course thumbnail to upload',
                        show: true,
                        context: 'info'
                    };

                    return false;
                }

                this.newCourseValidationErrors.basicInformation = (this.$refs.addCourseForm.validate() !== true) ? 'Some fields are invaid' : '';
                this.newCourseValidationErrors.modules = (this.newCourse.modules.length < 1) ? 'At least 1 module is required' : '';

                return !this.newCourseValidationErrors.basicInformation
                    && !this.newCourseValidationErrors.modules;
            },
            async addCourse() {
                this.isAddingCourse = true;

                try {
                    const addCourse = firebase.functions()
                                            .httpsCallable('addCourse');

                    const courseData = cloneDeep(this.newCourse);

                    delete courseData.createdAt;

                    await addCourse({ courseData });

                    await this.deleteDraft();

                    this.newCourse = cloneDeep(init.newCourse);
                    this.$refs.addCourseForm.resetValidation();
                    this.step = 1;

                    this.$router.push('/courses');
                } 
                catch (error) {
                    this.$store.commit('push_notification', { 
                        notification: {
                            message: error.message,
                            context: 'error',
                        }
                    });
                }
                
                this.isAddingCourse = false;
            },
            validateAddLessonForm() {
                return this.$refs.addLessonForm.validate();
            },
            async addLesson() {
                this.isAddingLesson = true;

                const newLesson = cloneDeep(this.newLesson);

                if (newLesson.contentType === 'video') {
                    const videoFile = newLesson.content.video.file;
                    const thumbnailFile = newLesson.content.video.thumbnail.file;

                    const video = {
                        ...await this.uploadFile(videoFile, 'lessons/videos'),
                        thumbnail: await this.uploadFile(thumbnailFile, 'lessons/videos/thumbnails')
                    };

                    newLesson.content = { video }
                } 
                else if (newLesson.contentType === 'html') {
                    newLesson.content = { html: newLesson.content.html };
                }
                else if (newLesson.contentType === 'questions') {
                    newLesson.content = { questions: newLesson.content.questions };
                }

                this.newModule.lessons.push(newLesson);

                this.newLesson = cloneDeep(init.newLesson);

                this.isAddingLesson = false;

                this.$refs.addLessonForm.resetValidation();
            },
            editLesson(lesson) {
                this.newLesson = lesson;
            },
            removeLesson(lesson) {
                const index = this.newModule.lessons.indexOf(lesson);

                this.newModule.lessons.splice(index, 1);

                // Todo: If contentType == video, delete video and thumbnail from storage
            },
            async uploadFile(file, storagePath) {
                return new Promise((resolve, reject) => {
                    const ref = `${storagePath}/${uuidv4()}_${file.name}`;
                    const storageRef = firebase.storage().ref();

                    const metadata = {
                        contentType: file.type,
                    };

                    const uploadTask = storageRef.child(ref).put(file, metadata);

                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snapshot => {
                        const percentUpload = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

                        this.$store.commit('push_notification', { 
                            notification: {
                                message: `Uploading "${file.name}" (${percentUpload}%)`,
                                context: 'info',
                                timeout: -1,
                                tag: 'upload',
                            }
                        });
                    }, error => {
                        this.$store.commit('push_notification', { 
                            notification: {
                                message: `Error uploading "${file.name}"`,
                                context: 'error',
                                tag: 'upload',
                            }
                        });

                        reject(error);
                    }, async () => {
                        this.$store.commit('push_notification', { 
                            notification: {
                                message: `Successfully uploaded "${file.name}"`,
                                context: 'success',
                                tag: 'upload',
                            }
                        });

                        const src = await uploadTask.snapshot.ref.getDownloadURL();

                        const upload = {
                            fileName: file.name,
                            fullPath: ref,
                            src,
                        }
                        
                        resolve(upload);
                    });
                });
            },
            async createVideoThumbnail() {
                return new Promise((resolve, reject) => {
                    const canvasElement = this.$refs.videoThumbnail;
                    const videoElement = this.$refs.video;

                    const width = videoElement.videoWidth;
                    const height = videoElement.videoHeight;

                    canvasElement.width = width;
                    canvasElement.height = height;

                    canvasElement.getContext('2d').drawImage(videoElement, 0, 0);

                    canvasElement.toBlob(thumbnailImage => {
                        thumbnailImage.name = 'thumbnail';
                        
                        resolve(thumbnailImage);
                    },'image/png');
                });
            },
            addNewQuestionOption() {
                this.newQuestion.options.push('');
            },
            removeNewQuestionOption(index) {
                this.newQuestion.options.splice(index, 1);
            },
            validateAddQuestionForm() {
                return this.$refs.addQuestionForm.validate();
            },
            addQuestion() {
                this.isAddingQuestion = true;

                const newQuestion = cloneDeep(this.newQuestion);

                this.newLesson.content.questions.push(newQuestion);

                this.newLesson.durationInSeconds += newQuestion.durationInSeconds;

                this.newQuestion = cloneDeep(init.newQuestion);

                this.isAddingQuestion = false;

                this.isShowingAddQuestionForm = false;

                this.$refs.addQuestionForm.resetValidation();
            },
            editQuestion(question) {
                this.newQuestion = question;

                this.isShowingAddQuestionForm = true;
            },
            removeQuestion(question) {
                const index = this.newLesson.content.questions.indexOf(question);

                this.newLesson.content.questions.splice(index, 1);

                this.newLesson.durationInSeconds -= question.durationInSeconds;
            },
            validateAddModuleForm() {
                this.newModuleValidationErrors.lessons = (this.newModule.lessons.length < 1) ? 'At least 1 lesson is required' : '';

                return this.$refs.addModuleForm.validate() 
                    && !this.newModuleValidationErrors.lessons;
            },
            addModule() {
                this.isAddingModule = true;

                const newModule = cloneDeep(this.newModule);

                this.newCourse.modules.push(newModule);

                this.newModule = cloneDeep(init.newModule);

                this.isAddingModule = false;

                this.$refs.addModuleForm.resetValidation();

                this.isShowingAddQuestionForm = true;
            },
            computeCourseModuleDuration(courseModule) {
                const moduleDuration = courseModule.lessons.reduce((total, currentModule) => {
                                            return total + currentModule.durationInSeconds;
                                        }, 0);

                return moduleDuration;
            },
            async loadDraft() {
                const draftId = this.$route.query.draftId;

                if (draftId) {
                    this.draftId = draftId;

                    const courseDraft = (await firebase.firestore()
                                                    .doc(`courseDrafts/${draftId}`)
                                                    .get())
                                                    .data();

                    this.newCourse = courseDraft;
                }
            },
            async saveDraft() {
                this.isSavingDraft = true;
            
                if (this.draftId) {
                    await firebase.firestore()
                                .doc(`courseDrafts/${this.draftId}`)
                                .set({
                                    ...this.newCourse,
                                });
                }
                else {
                    const courseDraftRef = await firebase.firestore()
                                                        .collection(`courseDrafts`)
                                                        .add({
                                                            ...this.newCourse,
                                                            createdAt: new Date().valueOf(),
                                                        });

                    this.draftId = courseDraftRef.id;
                }

                this.isSavingDraft = false;

                this.draftSaved = true;

                this.$router.push('/courses');
            },
            async deleteDraft() {
                if (this.draftId) {
                    try {
                        await firebase.firestore()
                                    .doc(`courseDrafts/${this.draftId}`)
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
                }
            },
        },
        mounted() {
            this.loadDraft();
        },
        beforeRouteLeave(to, from, next) {
            if (!this.dataEntered || this.draftSaved || confirm("You have some unsaved changes. Are you sure you want to leave?")) {
                removeEventListener('beforeunload', beforeUnloadListener, { capture: true });
                
                return next();
            };
        },
        filters: {
            toTimer(durationInSeconds) {
                const seconds = (durationInSeconds % 60);
                const minutes = (Math.floor(durationInSeconds / 60));

                let secondsString = seconds.toString();
                let minutesString = minutes.toString();

                if (secondsString.length === 1) {
                    secondsString = `0${secondsString}`;
                }

                if (minutesString.length === 1) {
                    minutesString = `0${minutesString}`;
                }

                return `${minutesString}:${secondsString}`;
            },
        },
    };
</script>

<style scoped>
    .active-panel {
        color:#325279 !important;
    }
    .label::before {
        opacity: 0.12;
    }
</style>

<style>
    .curriculum-wrapper>.v-expansion-panel-content__wrap {
        padding: 0 !important;
    }
</style>