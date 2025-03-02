    resetGlobalAlpha() {
        this.globalAlpha = 1.0;
    }
    
    /**
     * Force a full reset of all framebuffers
     * Used when shapes change dramatically to prevent artifacts
     */
    resetFramebuffers() {
        if (\!this.framebuffers || this.framebuffers.length === 0) return;
        
        const { gl } = this;
        
        // Clear both framebuffers to prevent artifacts
        for (let i = 0; i < this.framebuffers.length; i++) {
            const fb = this.framebuffers[i];
            fb.bind();
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        
        // Reset to default framebuffer (screen)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
    }
