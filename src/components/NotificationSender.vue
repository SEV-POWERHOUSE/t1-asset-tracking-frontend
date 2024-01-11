<script>
import axios from 'axios';

const apiBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://project3.eaglesoftwareteam.com' // Production URL
  : 'http://localhost:3021'; // Local URL

export default {
  methods: {
    async sendEmail(emailDetails, type) {
      try {
        // console.log('Email details:', emailDetails)
        const response = await axios.post(`${apiBaseUrl}/accommodations-t1/sendEmail/${type}`, emailDetails);
        console.log('Email sent successfully:', response.data);
      } catch (error) {
        console.error('Email could not be sent from frontend:', error);
      }
    }
  }
};
</script>

<template>
  
</template>
