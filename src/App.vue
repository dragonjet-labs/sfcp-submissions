<script setup>
</script>

<template>
  <v-sheet width="600" class="mx-auto">
    <v-form fast-fail @submit.prevent="submit" v-if="!submitting">
      <v-file-input
        id="espFile"
        :rules="[rules.required]"
        accept=".esm,.esp,.esl,.png"
        label="ESM/ESP/ESL File">
      </v-file-input>

      <v-text-field
        :rules="[rules.required]"
        v-model="message"
        label="Short Message">
      </v-text-field>

      <v-btn type="submit" block class="mt-2">Submit</v-btn>
    </v-form>
  </v-sheet>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    message: '',
    espFile: null,
    submitting: false,
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
      const res = await axios.post('/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res && res.data && res.data.redirect) {
        window.location.href = res.data.redirect;
      } else {
        window.location.reload();
      }
    },
  },
}
</script>

<style scoped>
</style>
