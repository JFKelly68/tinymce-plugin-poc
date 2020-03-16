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
      currentTabIndex: 0
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
      title: 'Insert/edit image gallery',
      initialData: {},
      body: {
        type: 'tabpanel',
        tabs: [],
      },
      buttons: [
        {
          type: 'submit',
          text: 'Confirm',
          primary: true,
        },
        {
          type: 'cancel',
          text: 'Cancel',
        },
      ], 
      onAction: this._onAction.bind(this),
      onSubmit: this._onSubmit.bind(this),
      onTabChange: this._onTabChange.bind(this),
    }
  }

  _createImageTab () {
    this.state.numImages++;

    return {
      name: `image-${this.state.numImages}`,
      title: `Image ${this.state.numImages}`,
      items: [
        {
          type: 'button',
          text: 'Add Image',
          name: 'addImage',
        },
        {
          type: 'button',
          text: 'Delete Image',
          name: 'deleteImage',
        },
        {
          type: 'urlinput',
          filetype: 'image',
          name: `image-${this.state.numImages}_url`,
          label: 'Source URL',
        },
        {
          type: 'urlinput',
          filetype: 'image',
          name: `image-${this.state.numImages}_thumbnail-url`,
          label: 'Thumbnail URL',
        },
        {
          type: 'input',
          inputMode: 'text',
          name: `image-${this.state.numImages}_alt-text`,
          label: 'Alt Text',
        },
        {
          type: 'checkbox',
          name: `image-${this.state.numImages}_click-to-zoom`,
          label: 'Click-to-zoom',
        },        
        {
          type: 'input',
          inputMode: 'text',
          name: `image-${this.state.numImages}_headline`,
          label: 'Related headline<sup>*</sup>',
        },
        {
          type: 'input',
          inputMode: 'text',
          name: `image-${this.state.numImages}_description`,
          label: 'Related description<sup>*</sup>',
        }
      ],
    }
  }

  _addImage (dialogApi, details) {
    this.dialog.body.tabs.push(this._createImageTab());
    this.state.currentTabIndex = this.state.numImages - 1;
    if (dialogApi) {
      this._updateData(dialogApi, dialogApi.getData());
      dialogApi.showTab(`image-${this.state.numImages}`);
    }
    console.log("add: ", this.state.currentTabIndex);
  }

  _deleteImage (dialogApi) {
    if (this.dialog.body.tabs.length === 1) {
      return;
    }

    const currentTabIndex = this.state.currentTabIndex;
    this.dialog.body.tabs.splice(currentTabIndex, 1);

    if (currentTabIndex + 1 === this.state.numImages) {
      this.state.numImages--;
      if (dialogApi) {
        this._updateData(dialogApi, dialogApi.getData());
        this.state.currentTabIndex = this.state.numImages - 1;
        dialogApi.showTab(`image-${this.state.currentTabIndex + 1}`);
      }
    } else {
      this.state.numImages--;
      this._updateTabNumbers();
      if (dialogApi) {
        this._updateData(dialogApi, dialogApi.getData());
        this.state.currentTabIndex = currentTabIndex;
        dialogApi.showTab(`image-${this.state.currentTabIndex + 1}`);
      }
    }
    console.log("delete: ", this.state.currentTabIndex);
  }

  _updateTabNumbers() {
    this.dialog.body.tabs.forEach((obj, index) => {
      const count = index + 1
      obj.name = `image-${count}`;
      obj.title = `Image ${count}`;
    });
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
      case 'deleteImage':
        return this._deleteImage(dialogApi, details);
    }
  }

  _onSubmit (dialogApi, details) {
    const data = this._updateData(dialogApi, dialogApi.getData());
    const el = this._createEditorPlaceholder(data);

    this.editor.insertContent(el.outerHTML);
    this._updateData(dialogApi, {});
    this._closeDialog();
  }

  _onTabChange (dialogApi, details) {
    this.state.currentTabIndex = parseInt(details.newTabName.split('-').pop()) - 1;
    console.log("change: ", this.state.currentTabIndex);
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