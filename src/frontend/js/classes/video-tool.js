export default class VideoTool {
  static get toolbox() {
    return {
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.25 3.75H3.75C2.36929 3.75 1.25 4.86929 1.25 6.25V13.75C1.25 15.1307 2.36929 16.25 3.75 16.25H16.25C17.6307 16.25 18.75 15.1307 18.75 13.75V6.25C18.75 4.86929 17.6307 3.75 16.25 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M8.125 6.875L13.125 10L8.125 13.125V6.875Z" fill="currentColor"/></svg>`,
      title: 'Video',
      name: 'video', // Diagnostic: Add name property
    };
  }

  constructor({ data, api, config, block }) {
    this.data = data || {};
    this.api = api;
    this.config = config || {};
    this.block = block;
    this.wrapper = null;
    this.alignment = data.alignment || 'center';
    this.filetype = data.filetype || 'file';

    this.name = 'video'; // Diagnostic: Add name property to instance
    
    this._handleFileUpload = this._handleFileUpload.bind(this);
    this._handleUrlSubmit = this._handleUrlSubmit.bind(this);
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('video-tool');

    if (this.data.url) {
      const filetype = this.data.filetype || 
                      (this.data.url.includes('youtube') ? 'youtube' : 
                       this.data.url.includes('rutube') ? 'rutube' : 'file');
      
      this._createVideoElement(this.data.url, this.data.caption || '', filetype);
    } else {
      this._createUploadForm();
    }

    return this.wrapper;
  }

  _createUploadForm() {
    const currentUrl = this.wrapper?.querySelector('.embed-url')?.value || '';
    this.wrapper.innerHTML = `
      <div class="video-upload-tabs">
        <div class="tabs-header">
          <button class="tab-button active" data-tab="upload">Upload</button>
          <button class="tab-button" data-tab="embed">Embed URL</button>
        </div>
        <div class="tab-content active" data-tab="upload">
          <label class="video-upload-button">
            <input type="file" accept="video/mp4,video/webm,video/ogg" class="video-file-input">
            <span>Select Video File</span>
          </label>
        </div>
        <div class="tab-content" data-tab="embed">
          <div class="embed-form">
            <select class="embed-service">
              <option value="youtube">YouTube</option>
              <option value="rutube">Rutube</option>
            </select>
            <input type="text" class="embed-url" placeholder="Paste video URL...">
            <button class="embed-submit">Добавить</button>
          </div>
        </div>
      </div>
    `;
    
    this._bindFormHandlers();
    if (currentUrl) {
      const urlInput = this.wrapper.querySelector('.embed-url');
      if (urlInput) urlInput.value = currentUrl;
    }
  }

  _bindFormHandlers() {
    this.wrapper.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.wrapper.querySelectorAll('.tab-button, .tab-content').forEach(el => {
          el.classList.toggle('active', el.dataset.tab === btn.dataset.tab);
        });
        
        this._bindFormHandlers();
      });
    });

    const fileInput = this.wrapper.querySelector('.video-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', this._handleFileUpload);
    }

    const embedSubmit = this.wrapper.querySelector('.embed-submit');
    if (embedSubmit) {
      embedSubmit.addEventListener('click', this._handleUrlSubmit);
    }
  }

  async _handleFileUpload(event) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    if (!this.config.uploader || !this.config.uploader.byFile) {
      this._showError('File upload is not configured');
      return;
    }

    try {
      const url = await this._uploadFile(file);
      this.type = 'file';
      this.data = { url, type: 'file' };
      this._createVideoElement(url, '');
    } catch (error) {
      this._showError('File upload failed: ' + error.message);
    }
  }

  _handleUrlSubmit() {
    const wrapper = this.wrapper;
    const service = wrapper.querySelector('.embed-service').value;
    const urlInput = wrapper.querySelector('.embed-url');
    const url = urlInput.value.trim();

    if (!url) {
        this._showError(',  URL ');
        return;
    }

    try {
        const submitBtn = wrapper.querySelector('.embed-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '...';

        const embedUrl = this._parseEmbedUrl(service, url);
        
        this.data = {
            url: embedUrl,
            filetype: service,
            alignment: this.alignment,
            caption: ''
        };

        this.api.blocks.update(this.block.id, this.data);

        submitBtn.disabled = false;
        submitBtn.textContent = ' ';

    } catch (error) {
        this._showError(error.message);
        const submitBtn = wrapper.querySelector('.embed-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = ' ';
        }
    }
  }

  _parseEmbedUrl(service, url) {
    if (service === 'youtube') {
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regExp);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }
    
    if (service === 'rutube') {
      const regExp = /rutube\.ru\/(?:video\/|play\/embed\/|video\/embed\/)?([a-zA-Z0-9]+)/i;
      const match = url.match(regExp);
      if (match && match[1]) {
          return `https://rutube.ru/play/embed/${match[1]}`;
      }
      
      throw new Error(' URL Rutube.   : https://rutube.ru/video/CODE/');
    }
    
    throw new Error('Invalid URL.');
  }

  _createVideoElement(url, caption, filetype = null) {
    this.wrapper.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'video-container';
    container.style.margin = this._getAlignmentMargin();
    container.style.position = 'relative';
    container.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
    container.style.height = '0';
    container.style.overflow = 'hidden';

    const type = filetype || this.filetype || 
        (url.match(/\.(mp4|webm|ogg)$/i) ? 'file' :
        (url.includes('youtube.com/embed') || url.includes('youtu.be') ? 'youtube' :
        (url.includes('rutube.ru/embed') || url.includes('rutube.ru/video') ? 'rutube' : 'file')));

    const mediaContainer = document.createElement('div');
    mediaContainer.style.position = 'absolute';
    mediaContainer.style.top = '0';
    mediaContainer.style.left = '0';
    mediaContainer.style.width = '100%';
    mediaContainer.style.height = '100%';

    if (type === 'file') {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.verticalAlign = 'top'; // Добавляем vertical-align
        mediaContainer.appendChild(video);
    } else {
        const iframe = document.createElement('iframe');
        iframe.src = url.includes('rutube.ru/video') ? 
                     url.replace('rutube.ru/video', 'rutube.ru/play/embed') : url;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.verticalAlign = 'top'; // Добавляем vertical-align
        mediaContainer.appendChild(iframe);
    }

    container.appendChild(mediaContainer);
    this._addCaption(container, caption);
    this.wrapper.appendChild(container);
  }

  _addCaption(container, captionText) {
    if (!captionText) return;
    
    const caption = document.createElement('div');
    caption.className = 'video-caption';
    caption.contentEditable = true;
    caption.innerHTML = captionText;
    container.appendChild(caption);
  }

  async _uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(this.config.uploader.byFile, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data?.file?.url) {
        throw new Error('Invalid response format');
      }
  
      return data.file.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  save(blockContent) {
    const video = blockContent.querySelector('video, iframe');
    const caption = blockContent.querySelector('.video-caption');
    
    return {
      url: video?.src || this.data.url || '',
      caption: caption?.innerHTML || this.data.caption || '',
      alignment: this.alignment,
      filetype: this.filetype || (video?.tagName === 'IFRAME' ? 
                                (video.src.includes('youtube') ? 'youtube' : 'rutube') 
                                : 'file')
    };
  }

  _getAlignmentMargin() {
    switch(this.alignment) {
      case 'left': return '0 auto 0 0';
      case 'right': return '0 0 0 auto';
      default: return '0 auto';
    }
  }

  _showError(message) {
    if (!this.wrapper) return;
    
    const currentTab = this.wrapper.querySelector('.tab-button.active').dataset.tab;
    const currentUrl = this.wrapper.querySelector('.embed-url')?.value || '';
    
    this.wrapper.innerHTML = `
        <div class="video-error">
            <p>${message}</p>
            <button class="retry-button"> </button>
        </div>
    `;
    
    this.wrapper.querySelector('.retry-button').addEventListener('click', () => {
        this._createUploadForm();
        if (currentTab === 'embed') {
            const embedUrl = this.wrapper.querySelector('.embed-url');
            if (embedUrl) embedUrl.value = currentUrl;
        }
    });
  }
}
