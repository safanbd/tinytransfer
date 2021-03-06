(function($) {
    "use strict";

    function handle_ajax(button, data, type, cb) {
        button.addClass('loading');
        button.attr("disabled", "true");
        jQuery.ajax({
            url: "/tiny_transfer_setting/handle",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            type: type,
            success: function(response) {
                setTimeout(() => {
                    button.removeClass("loading");
                    button.removeAttr("disabled");
                }, 1000);

                if (response.code == 200) {
                    spop({
                        template: response.msg,
                        position: "top-center",
                        style: "success",
                        autoclose: 1200,
                        onClose: function() {
                            if (cb) {
                                cb(response.data);
                            }
                        }
                    });
                } else {
                    spop({
                        template: response.msg,
                        position: "top-center",
                        style: "error",
                        autoclose: 1200
                    });
                }
            }
        });
    }

    if ($('.setting-info-page').length == 1) {

        // Updates a file progress, depending on the parameters it may animate it or change the color.
        function ui_multi_update_file_progress(id, percent, active) {
            active = typeof active === "undefined" ? true : active;

            var progressPanel = jQuery("#uploaderFile" + id).find(".progress-panel");
            if (active == false) {
                progressPanel.fadeOut(300);
            }

            var percentSpan = progressPanel.find("span");
            var bar = progressPanel.find(".file-progress-bar");
            bar.width(percent + "%");

            if (percent === 0) {
                percentSpan.text("");
            } else {
                percentSpan.text(percent + "%");
            }
        }

        jQuery(".from-upload").Uploader({
            url: "/tiny_transfer_setting/upload",
            multiple: false,
            dnd: false,
            maxFileSize: 300 * 1024 * 1024, // 3 Megs
            allowedTypes: "image/*",
            extFilter: ['jpg', 'jpeg', 'png', 'gif'],
            onDragEnter: function() {
                console.log("onDragEnter");
            },
            onDragLeave: function() {
                console.log("onDragLeave");
            },
            onInit: function() {
                console.log("Upload initialized :)");
            },
            onComplete: function() {
                console.log("All pending tranfers finished");
            },
            onNewFile: function(id, file) {
                console.log("New file added #" + id);
                $(this).prop("id", "uploaderFile" + id);
            },
            onBeforeUpload: function(id) {
                // about tho start uploading a file
                console.log("Starting the upload of #" + id);
                ui_multi_update_file_progress(id, 0, true);
            },
            onUploadProgress: function(id, percent) {
                // Updating file progress
                ui_multi_update_file_progress(id, percent);
            },
            onUploadSuccess: function(id, data) {
                // A file was successfully uploaded
                console.log("Server Response for file #" + id + ": " + JSON.stringify(data));
                console.log("Upload of file #" + id + " COMPLETED", "success");
                ui_multi_update_file_progress(id, 100, false);
                if (data.code == 200) {
                    $(this).find('.preview').css("background-image", "url(" + data.data + ")");
                    $(this).find('.preview').find("[name='logo']").val(data.data);
                }
            },
            onUploadError: function(id, xhr, status, message) {
                // Happens when an upload error happens
                ui_multi_update_file_progress(id, 0, false);
            },
            onFallbackMode: function() {
                // When the browser doesn't support this plugin :(
                console.log(
                    "Plugin cant be used here, running Fallback callback",
                    "danger"
                );
            },
            onFileSizeError: function(file) {
                spop({
                    template: "File '" + file.name + "' cannot be added: size excess limit",
                    position: "top-center",
                    style: "error",
                    autoclose: 1200
                });
            },
            onFileExtError: function(file) {
                spop({
                    template: "File format error, please upload image type",
                    position: "top-center",
                    style: "error",
                    autoclose: 1200
                });
            },
            onFileTypeError: function() {
                spop({
                    template: "This file is not an allowed type",
                    position: "top-center",
                    style: "error",
                    autoclose: 1200
                });
            }
        });


        // save click
        jQuery(document).on('click', '.save', function() {

            var button = jQuery(this);

            // submit data
            var data = {
                title: jQuery("[name='title']").val(),
                logo: jQuery("[name='logo']").val(),
                description: jQuery("[name='description']").val(),
                keywords: jQuery("[name='keywords']").val()
            };

            handle_ajax(button, data, "PUT");
        });

    }

})(jQuery);