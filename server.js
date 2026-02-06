// Importar herramientas
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv")
const result = dotenv.config();
const { serve } = require("inngest/express");
const { inngest } = require("./inngest/client");
const { notificarVictoria } = require("./inngest/functions/sudoku-functions");

const app = express();

//configurar puerto
const PORT = process.env.PORT || 3000;

//configurar los permisos y que se pueda trabajar con JSON
app.use(cors()); //Para las peticiones desde Android
app.use(express.json());

app.use("/api/inngest", serve({ 
    client: inngest, 
    functions: [notificarVictoria] 
}));

//conectar con mongodb

async function connectarBd(){
    try {
        console.log("Iniciando conexión a MongoDB...")
        // Intentamos conectar, pero con un tiempo de espera corto (timeout)
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        console.log("Conectado a MongoDB");
    } catch(error) {
        // Si falla, mostramos el error pero NO detenemos el proceso
        console.log("MongoDB offline (Error de red), pero el servidor arrancará igual.");
        console.log("Detalle:", error.message);
    }

    // Arrancamos el servidor de Express fuera del catch
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`Pista: Si estás en clase, usa el hotspot de tu móvil si Mongo sigue fallando.`);
    });
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
            await inngest.send({
                name: "sudoku/completado",
                data: {
                    usuario: nombre,
                    tiempo: tiempo,
                    dificultad: dificultad
                }
            });
            res.status(201).json({ mensaje: "Puntuación registrada y evento enviado" });
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