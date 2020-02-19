export default function (editor, uri) {
  const plugin = new testPlugin({
    editor,
  });

};

class testPlugin {

  constructor (opts) {
    this.editor = opts.editor;
    this.dialog = null;

    this.state = null;

    this._init();
    this._register();
  }

  _init () {
    this.state = {
      numImages: 0,
    };
    
    this.dialog = this._createDialog();
    this._addImage();
  }

  _initWithSelection (dialogApi, selection) {
    this._init();
    this._updateData(dialogApi, {});


    if (!selection.classList.contains('image-gallery')) {
      return false;
    }
    const data = {};


    for (let key in selection.dataset) {
      if (key.indexOf('_url') !== -1) {
        data[key] = JSON.parse(selection.dataset[key]);
        this._addImage();
      }
    }

    this._updateData(dialogApi, data);
  }

  _createDialog () {
    return {
      title: 'Test Plugin',
      initialData: {},
      body: {
        type: 'tabpanel',
        tabs: [],
      },
      buttons: [
        {
          type: 'submit',
          text: 'Submit',
          primary: true,
        },
        {
          type: 'cancel',
          text: 'Cancel',
        },
      ], 
      onAction: this._onAction.bind(this),
      onSubmit: this._onSubmit.bind(this),
    }
  }

  _createImageTab () {
    this.state.numImages++;

    return {
      name: `image-${this.state.numImages}`,
      title: `${this.state.numImages} - TEST LONG TITLE`,
      items: [
        {
          type: 'urlinput',
          filetype: 'image',
          name: `image-${this.state.numImages}_url`,
          label: 'Image URL',
        },
        {
          type: 'button',
          text: 'Add Image',
          name: 'addImage',
        }
      ],
    }
  }

  _addImage (dialogApi, details) {
    this.dialog.body.tabs.push(this._createImageTab());
    if (dialogApi) {
      this._updateData(dialogApi, dialogApi.getData());
      dialogApi.showTab(`image-${this.state.numImages}`);
    }
  }

  _updateData (dialogApi, data) {
    this.dialog.initialData = data;
    dialogApi.redial(this.dialog);
    return this.dialog.initialData;
  }

  _onAction (dialogApi, details) {
    switch(details.name) {
      case 'addImage':
        return this._addImage(dialogApi, details);
    }
  }

  _onSubmit (dialogApi, details) {
    const data = this._updateData(dialogApi, dialogApi.getData());
    const el = this._createEditorPlaceholder(data);

    this.editor.insertContent(el.outerHTML);
    this._updateData(dialogApi, {});
    this._closeDialog();
  }

  _register () {
    this.editor.ui.registry.addButton('test', {
      text: 'Test Button',
      onAction: (dialogApi, details) => {
        this._openDialog();
      }
    });

    this.editor.ui.registry.addMenuItem('test', {
      text: 'Test Menu',
      onAction: function() {
        console.log('TESTING');
      }
    });
  }

  _createEditorPlaceholder (data) {
    const el = document.createElement('IMG');

    el.classList.add('image-gallery');
    el.src = data['image-1_url'].value;
    for (let key in data) {
      el.dataset[key] = JSON.stringify(data[key]);
    }

    return el;
  }

  _openDialog () {
    const dialogApi = this.editor.windowManager.open(this.dialog);
    const selection = this.editor.selection.getNode();
    this._initWithSelection(dialogApi, selection);
    return dialogApi;
  }

  _closeDialog () {
    this._init();
    return this.editor.windowManager.close(this.dialog);
  }

}