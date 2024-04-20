import {addThreadIdToLocalStorage, getDataFromLocalStorage} from "../../logic/helpers/helper-functions";

export function addSdOptions(currentThreadId: string | null){
    console.log("thread id is not in thread ids")
//button zum hinzufügen der thread id anheften
    const addThreadELem = `<img class="addThread" style="cursor: pointer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMESURBVDhPrZVpSFRRFMf/740zo+hgmjpODqNpmYWQwZgLZIL5oYxwiyJoFcJoozIjIsoPQYQgWYQ1TSAaKbmippKFpZaS5kZaUoimuGaoM46z9+71OSYaqPT78t4957z/vefcw3kMOHTTQ9bmkidoKs6CZmKImFaMk6sMIXHJUMaehoNExjBErPDOKXxvrITX1mB4bQniQxcwGk0QCu341WIGv7VhsPsTNoXuRcKNZ2DqctKsb9S3EJWUhpD4JD5sdTQVqTGvwaTHy6zOUjmOpxfz7rWRnRKHyZEBsKRmy6W5WogG0VpUGL3egO6vPZia0oBhGLi5ucDHWwF7ezF6e/sxMjpG60lgWQYyTynk8g0Qi0XURrAJErH39R+hUudifHwCApZFQMBmXL6YzH0kQ5YqG7XvPsDBwZ5eEMuw8Pf3Q0L8fuxU7uBVuI34J4aHR3D3XiaOHklEVXkeql/l02AniSP12wkEOHHsEAry1aipKkB56XN4eLgh8+FTtLZ1YnbWQONsgiaTGa6uLpxDz6Vl5FJiERkRDne39XzEYkQiIVKvnIPvRgWaW9qh0f0lSOqykXMEbQ9EYUkFyiqq0dXdA51ulgb9Czs7AYKVQTCZTdBotdRmOyE50fXUC0iIjUFxaSUy7j/G29p6TE9r+IjlsVoBrWYGFvLCQQX1et3cghM9mHgAL3KyEB0VgcwHKnxu7aTlWA6LxYrR0XFIpe4QCwXUZjuhVjuDXxO/bfWL2RcNF9d16P85AN3s0tQtFgvaO76grqERfn4+cHSYax3aNgbNJN2JpOjJ7SaRSDA2Ng6z2QyZTAqxSERT6+sbQGNjM5ydnWE0GZGT+xK7d4XT2jd0lC0IEry95RjiWqewqBwGo4HrQwHOnjmJsBAlbVyFwgvVr2vR0tpO40VCEa5dPY+wUCW98XmY25GwbttzGLGX0nnT2ijJSEFXTR5YMs8mB3/w5rVDNIgWS4YjmWc1qjTetXoqH92kGkRryYD18A20tdFKICdbNGCJ8f/9AmTMH8N0QjyBbMOkAAAAAElFTkSuQmCC"/>`

    $(".thread_answer").parent().parent().append(addThreadELem)
    $(".addThread").on("click", function () {
        const urlParams = new URLSearchParams(window.location.search);
        const edit_post_id = $(".post > a").attr("name")
        const thread_name: string | null = $(".clearfix > table").first().find("h2").text();
        const forum_name: string | null = $(".forum-container").find(".selected").text().trim();
        const forum_id= urlParams.get('forum_id');
        if (edit_post_id !== undefined) {
            addThreadIdToLocalStorage(currentThreadId, edit_post_id, thread_name, forum_name, forum_id);
            console.log(getDataFromLocalStorage("threadIds"))
            $(".addThread").remove()
            $("#tooltip").css({
                "display": "none",
            })
            const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
            $(".clearfix > table").first().find("h2").append(sdTableTitle)
        } else {
            console.error("edit_post_id is undefined")
        }

    });
    $(".addThread").on("mousemove", function (event) {
        //get mouse position
        let x: number = event.clientX;
        let y: number = event.clientY;

        //position des tooltips
        $("#tooltip").css({
            "top": `${y + 15}px`,
            "left": `${x + 12}px`,
            "right": "auto",
            "display": "",
        }).addClass("tooltip-style");
        $("#tooltip > h3").text("SD Tabelle hinzufügen")
    });
    $(".addThread").on("mouseout", function () {
        $("#tooltip").css({
            "display": "none",
        })
    });
}
