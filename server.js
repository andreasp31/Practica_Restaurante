// Importar herramientas
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv")
const result = dotenv.config();

const app = express();

//configurar puerto
const PORT = process.env.PORT || 3000;

//configurar los permisos y que se pueda trabajar con JSON
app.use(cors()); //Para las peticiones desde Android
app.use(express.json());


//conectar con mongodb

async function connectarBd(){
    try{
        console.log("Iniciando conexión a MongoDB...")
        await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Conectado a MongoDB");

        app.listen(PORT,'0.0.0.0', () =>{
            console.log(`Servidor ejecutándose en http://localhost:${3000}`);
        });
    }
    catch(error){
        console.log("Error en conexión a MongoDB: ", error);
    }
}

const puntuacionEsquema = new mongoose.Schema({
    nombre:{
        type:String,
        required: true
    },
    tiempoSegundos:{
        type:Number,
        required: true
    },
    tiempo:{
        type:String,
        required:true
    },
    dificultad:{
        type:String,
        enum: ['facil','medio','dificil'],
        default: 'facil'
    }
})


//Modelos creados
const Puntuacion = mongoose.model("Puntuacion",puntuacionEsquema);


app.get("/",(req,res) => {
    res.json({
        message: "¡Servidor funcionando correctamente!",
        endpoints: {
            guardarPuntuacion:"POST /api/puntuacion",
            obtenerTodas: "GET /api/puntuacion",
            obtenerRanking: "GET /api/ranking/:dificultad"
        }
    })
})


//Ruta para obtener todas los productos
app.get("/api/puntuacion",async(req,res)=>{
    try{
        const puntuacion = await Puntuacion.find();
        res.json(puntuacion);
    }
    catch(error){
        console.log("Error al obtener las puntuaciones",error);
    }
})

app.post("/api/puntuacion", async (req, res) => {
    try{
        const {nombre,tiempoSegundos,tiempo, dificultad} = req.body;
            const nuevaPuntuacion = new Puntuacion({
                nombre,
                tiempoSegundos,
                tiempo,
                dificultad
            });
            await nuevaPuntuacion.save();
            console.log("Puntuación guardada:", nuevaPuntuacion);
    }
    catch(error){
        console.log("Error al guardar la puntuacion",error);
    }
})


app.get("/api/ranking/:dificultad",async(req,res)=>{
    try{
        const { dificultad } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        if (!['facil', 'medio', 'dificil'].includes(dificultad)) {
            return res.status(400).json({ 
                error: "Dificultad no válida" 
            });
        }
        const ranking = await Puntuacion.find({ dificultad })
            .sort({ tiempo: 1 }) // Menor tiempo primero
            .limit(parseInt(limit));
        
        const rankingPosicion = ranking.map((puntuacion, index) => ({
            posicion: index + 1,
            nombre: puntuacion.nombre,
            tiempo: puntuacion.tiempo,
        }));
        
        res.json(rankingPosicion);
    }
    catch(error){
        console.error("Error al obtener ranking:", error);
    }
})


connectarBd();