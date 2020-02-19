import '../index.html';
import '../styles/main.scss';

import tm from '../../lib/tinymce/tinymce.min.js';
import testPlugin from './plugins/testPlugin';
console.log('APP');

tinymce.PluginManager.add('testPlugin', testPlugin);

tinymce.init({
  selector: 'textarea',
  plugins: 'testPlugin anchor media emoticons image',
  toolbar: "test emoticons image| undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | media"
});


