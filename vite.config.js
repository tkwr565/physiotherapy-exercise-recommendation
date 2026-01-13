import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        home: './home.html',
        demographics: './demographics.html',
        questionnaire: './questionnaire.html',
        sts: './sts-assessment.html',
        results: './results.html',
        physio: './physio.html'
      }
    }
  }
});
