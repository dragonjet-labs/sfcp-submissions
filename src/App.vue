<script setup>
</script>

<template>
  <v-sheet width="600" class="mx-auto">
    <!-- SUBMISSION -->
    <v-form fast-fail @submit.prevent="submit" v-if="!submitting && !espUrl">
      <v-file-input
        id="espFile"
        :rules="[rules.required]"
        accept=".esm,.esp,.esl"
        label="ESM/ESP/ESL File">
      </v-file-input>

      <v-text-field
        :rules="[rules.required]"
        v-model="message"
        label="Short Message">
      </v-text-field>

      <v-btn type="submit" block class="mt-2">Submit</v-btn>
    </v-form>

    <!-- LOADING -->
    <div v-if="this.submitting" style="text-align:center;">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <!-- SUCCESS -->
    <v-alert v-if="espUrl && branchname" title="Success!" type="success" style="text-align:left;" variant="tonal">
      Thank you for uploading a fix!<br /> 
      Please proceed to describe the nature of your bug and what the fix was, and submit the report at
      <a href="https://www.starfieldpatch.dev/report" class="text-black" target="_blank">
        https://www.starfieldpatch.dev/report
      </a>.
      <br /><br />
      Please include the following information:
      <ul>
        <li>ESP URL: <span class="text-black">{{ espUrl }}</span></li>
        <li>Branch Name: <span class="text-black">{{ branchname }}</span></li>
      </ul>
      <br />
      If you'd like to see the status of your plugin file, 
      <a href="https://github.com/dragonjet-labs/sfcp-flows/actions" class="text-black" target="_blank">you may check here</a>.
    </v-alert>

    <!-- ERROR -->
    <v-alert v-if="errorMessage" title="Error" :text="errorMessage" type="error"></v-alert>
  </v-sheet>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    message: '',
    espFile: null,
    submitting: false,
    espUrl: null,
    branchname: null,
    errorMessage: '',
    rules: {
      required: value => !!value || 'Field is required',
    },
  }),
  methods: {
    async submit () {
      this.submitting = true;
      let formData = new FormData();
      const fileInput = document.querySelector('#espFile');
      formData.append('message', this.message);
      formData.append('espFile', fileInput.files[0]);
      axios.post('/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((res) => {
        this.submitting = false;
        this.espUrl = res.data.espUrl;
        this.branchname = res.data.branchname;
      }).catch((err) => {
        this.submitting = false;
        this.errorMessage = err.message;
      });
    },
  },
}
</script>

<style scoped>
</style>
