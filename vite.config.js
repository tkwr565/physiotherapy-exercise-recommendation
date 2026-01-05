import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: './home.html',
        questionnaire: './questionnaire.html',
        sts: './sts-assessment.html',
        analysis: './analysis.html',
        // Legacy pages (to be removed later)
        oldIndex: './index.html',
        physio: './physio.html'
      }
    }
  }
});
