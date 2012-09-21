<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Presentation Demo</title>
        
        <script src="../../../libraries/jquery/jquery-1.8.1.min.js"></script>
        <script src="../../ppw/ppw.js"></script>
    </head>
    <body>
        <script>
            window.PPW.init({
                // basic configurations
                title: "Title of my demo1 presentation",
                authors: [
                    {
                        name: "Felipe N. Moura",
                        email: "felipenmoura@gmail.com",
                        twitter: "@felipenmoura",
                        picture: "https://twimg0-a.akamaihd.net/profile_images/1182045890/me.jpg",
                        description: "A nice guy!"
                    }
                ],
                createAboutSlide: true, // automatically creates the ABOUT ME slide(s)
                useExternalSlides: true, // load slides with ajax(demands an http server)
                preloadSlides: true, // load all the slides before starting
                
                // presentation data
                PPWSrc: "../../ppw/",
                theme: "default",
                slides: [
                    {
                        type: 'opening',
                        id: 'first', // also used as source
                        notes: [
                            "this is the very first slide",
                            "and has only these two useless notes"
                        ]
                    }
                ]
            });
        </script>
    </body>
</html>
