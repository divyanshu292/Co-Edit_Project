// const mongoose = require("mongoose")
// const Document = require("./Document")

// mongoose.connect("mongodb://localhost/google-doc-clone", {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //    useFindAndModify: false,
// //     useCreateIndex: true,
//  })

// const io = require('socket.io')(3001,{
//     cors:{
//         origin: 'http://localhost:3000',
//         methods: ["GET", "POST"],
//     },
// })
// const defaultValue = ""
// io.on("connection", socket => {
//     socket.on("get-document", async documentId => {
//         const document = await findOrCreateDocument(documentId)
//         socket.join(documentId)
//         socket.emit("load-document", document.data)

//         socket.on('send-changes', delta => {
//             socket.broadcast.to(documentId).emit("receive-changes", delta)
//         })
//         socket.on("save-document", async data => {
//             await Document.findByIdAndUpdate(documentId, {data})
//         })
//     })
    
// })

// async function findOrCreateDocument(id){
//     if(id==null) return

//     const document = await Document.findById(id)
//     if(document) return document 
//     return await Document.create({_id: id, data: defaultValue})
// }


//--------------------------------------Some libraries and methods are deprecated above----------------
const mongoose = require("mongoose");
const Document = require("./Document");

mongoose.connect("mongodb://localhost/google-doc-clone", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
});

//mongoose.connect("mongodb+srv://Cluster11336:google-d-c@cluster11336.vee1tfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster11336", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
//});

const io = require("socket.io")(3001, {
    cors: {
        //origin: "http://localhost:3000",
        origin: "https://google-d-c-c-s.vercel.app",
        methods: ["GET", "POST"],
    },
});

const defaultValue = "";

io.on("connection", (socket) => {
    console.log("connected")
    socket.on("get-document", async (documentId) => {
        if (!documentId) {
            socket.emit("error", "Invalid document ID");
            return;
        }

        try {
            const document = await findOrCreateDocument(documentId);

            if (!document) {
                socket.emit("error", "Document not found or could not be created");
                return;
            }

            socket.join(documentId);
            socket.emit("load-document", document.data);

            socket.on("send-changes", (delta) => {
                socket.broadcast.to(documentId).emit("receive-changes", delta);
            });

            socket.on("save-document", async (data) => {
                await Document.findByIdAndUpdate(documentId, { data });
            });
        } catch (err) {
            console.error(`Error handling get-document event: ${err.message}`);
            socket.emit("error", "An error occurred while fetching the document");
        }
    });
});

async function findOrCreateDocument(id) {
    if (!id) return null;

    try {
        let document = await Document.findById(id);
        if (!document) {
            document = await Document.create({ _id: id, data: defaultValue });
        }
        return document;
    } catch (err) {
        console.error(`Error in findOrCreateDocument: ${err.message}`);
        return null;
    }
}
