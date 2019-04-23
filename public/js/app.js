$(document).ready(function() {
    var articleId = null;
  
    $('.text-success').fadeOut(1800, function() {
    });
  
    $('#save-note-modal').on('hidden.bs.modal', function(e) {
      $('#result-msg').remove();
      $('#new-note-text').show();
      $('.save-note').show();
    });
  
    $('.create-note, .view-note').on('click', function() {
      articleId = $(this).attr('data-id');
    });
  
    $('#scrape').on('click', function() {
      $('.article-container').empty();
      $('.article-container').append(`<div class="loader"></div>`);
      $.getJSON('/scrape', function(data) {
        $('.article-container').empty();
        displayArticles(data);
      });
    });
  
    $(document).on('click', '.save-article', function() {
      var self = $(this);
      // sends article id to the server to save article to the user
      $.post('/saveArticle', { id: $(this).attr('data-id') }, function(data) {
        // sends a message to the user saying it was saved, then removes the save article button
        $(`<p class="text-success mt-2">${data}</p>`).insertAfter(self);
        self.remove();
      });
    });
  
    $('.remove-article').on('click', function() {
      var self = $(this);
      $.ajax({
        url: '/removeArticle',
        data: { id: $(this).attr('data-id') },
        type: 'DELETE',
        success: function(result) {
          self.closest('.article').remove();
          if ($('.saved-articles').children().length < 1) {
            $('.article-container').empty();
            $('.article-container').append($(`<h2 class="text-center none">No Articles!</h2>`));
          }
        }
      });
    });
  
    $('.save-note').on('click', function(e) {
      e.preventDefault();
      $.post(
        '/saveNote',
        {
          body: $('#new-note-text')
            .val()
            .trim(),
          articleId: articleId
        },
        function(result) {
          $('#new-note-text').val('');
          $('#new-note-text').hide();
          $('.form-group').append(`<h3 id="result-msg">${result}</h3>`);
          $('.save-note').hide();
        }
      );
    });
  
    $('.view-note').on('click', function() {
      $('#all-article-notes').empty();
  
      $('#all-article-notes').append(`<div class="loader"></div>`);
  
      $.post('/getArticleNotes', { articleId: $(this).attr('data-id') }, function(result) {
  
        // if it was unsuccessful the type will be a string.
        if (typeof result === 'object') {
          var username = result.username;
          var result = result.result;
  
          $('.loader').remove();

          if (result.length < 1) {
            $('#all-article-notes').append($(`<h3>No Notes</h3>`));
          }
  
          result.forEach(note => {
            var noteContent = $(`
              <div class="mb-2 note-container">
                <span><span class="text-muted">${note.username}:</span> ${note.body}</span>
              </div>
            `);
  
            // if the authenticated user matches the note username, then the user can remove their own note
            if (username === note.username) {
              // creates remove note button
              noteContent.append(
                $(`
                <button type="button" class="close delete-note" aria-label="Close" data-id="${
                  note._id
                }">
                  <span aria-hidden="true"  
                    style="padding: 0 7px; color: white; background-color: #f44336">
                      ×
                  </span>
                </button>
                `)
              );
            }
  
            // appends to notes modal
            $('#all-article-notes').append(noteContent);
          });
        } else {
          // if this runs, then did not get a successful response. appends error message
          $('#all-article-notes').append(result);
        }
      });
    });
  
    // remove a users note from an article
    $(document).on('click', '.delete-note', function() {
      var self = $(this);
      $.post('/removeNote', { noteId: $(this).attr('data-id'), articleId: articleId }, function(
        result
      ) {
        // delete the note from the page
        if (result === 'success') {
          self.closest('.note-container').remove();
  
          // if there are no notes, inform the user
          if ($('#all-article-notes').children().length < 1) {
            $('#all-article-notes').append($(`<h3>No Notes</h3>`));
          }
  
          // write to the console if error occured while removing a note
        } else {
          console.log(result);
        }
      });
    });
  
    // append each article to the page
    function displayArticles(data) {
      // remove old articles before appending
      $('.saved-articles').empty();
  
      // remove message that says 'No Articles' on home page 
      $('.none').remove();
  
      // create each article container with its content
      data.forEach(article => {
        var row = $(`
          <div class="row article my-5 pb-4">
            <div class="col-sm-5 mb-3 mb-sm-3">
              <a href="${article.link}" target="_blank">
                <img class="img-fluid" src="${article.img}">
              </a>
            </div>
            <div class="col-sm-7 border-bottom border-secondary pb-3 pb-sm-3">
              <h3 class="mb-2">
                <a href="${article.link}" target="_blank">${article.title}</a> 
              </h3>
              <p class="mb-2">${article.excerpt}</p>
              <button type="button" class="btn save-article" data-id="${
                article._id
              }">Save Article</button>
            </div>
          </div>
        `);
        $('.article-container').append(row);
      });
    }
  });