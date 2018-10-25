  (function () {
      var readerModle;
      var readerUI;

      var RootContainer = $("#fiction_container");
      var Ulit = (function () {
          //   var prefix = 'html5_reader_';
          var StorageSetter = function (key, value) {
              return localStorage.setItem(key, value);
          }
          var StorageGetter = function (key) {
              return localStorage.getItem(key)
          }
          var getBSONP = function (url, callback) {
              return $.jsonp({
                  url: url,
                  cache: true,
                  callback: "duokan_fiction_chapter",
                  success: function (result) {

                      var data = $.base64.decode(result);
                      var json = decodeURIComponent(escape(data));
                      callback(json);
                  }
              })
          }
          return {
              getBSONP: getBSONP,
              StorageGetter: StorageGetter,
              StorageSetter: StorageSetter
          }

      })();



      function main() {

          //入口函数
          EventHanlder();
          readerModle = ReaderModle();
          readerUI = ReaderBaseFrame(RootContainer);
          readerModle.init(function (data) {
              readerUI(data);

          });
      }



      function ReaderModle() {
          //获取数据
          var Chapter_id;
          var Chapter_id;
          var Chapterlength;
          var init = function (UIcallback) {
              getFictionInfo(function () {
                  getCurChaptercontent(1, function (data) {
                      //方法的健壮缩写if(UIcallback){UIcallback(data)}
                      UIcallback && UIcallback(data);
                  })
              })
          }
          var getFictionInfo = function (callback) {
              $.get("data/chapter.json", function (data) {
                  Chapter_id = Ulit.StorageGetter("last_chapter_id")
                  if (Chapter_id != null) {

                      console.log(data.chapters[0]);
                      Chapter_id = data.chapters[1].chapter_id;
                  }

                  // console.log("nishi",data.chapters[0]);
                  Chapterlength = data.chapters.length;
                  callback && callback()
              }, "json")
          }

          //请求第四章介内容
          var getCurChaptercontent = function (chapter_id, callback) {
              $.get("data/data" + chapter_id + ".json", function (data) {
                  if (data.result === 0) {
                      var url = data.jsonp;
                      Ulit.getBSONP(url, function (data) {
                          // debugger;
                          callback && callback(data);

                      })

                  }
              }, "json");

          }

          //上下翻页函数封装
          var pervChapter = function (UIcallback) {
              Chapter_id = parseInt(Chapter_id, 10);

              if (Chapter_id == 0) {
                  return;
              }
              Chapter_id -= 1;
              getCurChaptercontent(Chapter_id, UIcallback);

              Ulit.StorageSetter("last_chapter_id", Chapter_id)
          }
          var nextChapter = function (UIcallback) {

              Chapter = parseInt(Chapter_id, 10)

              if (Chapter_id == Chapterlength) {
                  return;
              }
              Chapter_id += 1;
              getCurChaptercontent(Chapter_id, UIcallback);
              Ulit.StorageSetter("last_chapter_id", Chapter_id)
          }

          return {
              init: init,
              pervChapter: pervChapter,
              nextChapter: nextChapter,
          }
      }


      function ReaderBaseFrame(container) {
          //渲染基本的ui结构
          function parseChapterData(jsondata) {
              var jsonObj = JSON.parse(jsondata);
              //   console.log(jsonObj)
              var html = '<h4>' + jsonObj.t + "</h4>"

              // Ulit.StorageGetter(stu);
              for (var i = 0; i < jsonObj.p.length; i++) {
                  html += "<p style='text-indent:35px;'>" + jsonObj.p[i] + "</p>"

              }
              return html;
          }

          return function (data) {
              container.html(parseChapterData(data));
          }


      }

      function EventHanlder() {
          //交互事件绑定

          $("#prev_button").click(function () {

              window.scrollTo(0, 0);
              // alert("1")
              readerModle.pervChapter(function (data) {
                  var ss = readerUI(data);


              })

          });
          $("#next_button").click(function () {

              //点击下翻也回到
              window.scrollTo(0, 0);
              readerModle.nextChapter(function (data) {

                  readerUI(data);


              });

          });
      }
      main();
  })();