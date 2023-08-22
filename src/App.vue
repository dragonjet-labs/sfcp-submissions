<script setup>
import { ref, watch } from 'vue'

const branchname = ref(0);
watch(branchname, (newX) => {
  const stripped = newX.replace(/[^a-z0-9]/gi, '');
  branchname.value = stripped;
})
</script>

<template>
  <v-sheet width="600" class="mx-auto">
    <v-form fast-fail @submit.prevent="submit" v-if="!submitting">
      <v-text-field
        :rules="[rules.required]"
        pattern="[a-zA-Z0-9]+"
        v-model="branchname"
        label="Branch Name">
      </v-text-field>

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
    branchname: '',
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
      formData.append('pic', fileInput.files[0]);
      const res = axios.post('https://jetri.co', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('res', res);
    },
  },
}
</script>

<style scoped>
</style>
