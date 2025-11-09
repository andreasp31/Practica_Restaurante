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
        })
    }
    catch(error){
        console.log("Error en conexión a MongoDB: ", error);
    }
}

const productoEsquema = new mongoose.Schema({
    nombre:{
        type:String,
        required: true
    },
    descripcion:{
        type:String,
        required:true
    },
    precio:{
        type:Number,
        required: true
    },
    cantidad:{
        type:Number,
        required: true
    }
})

const productoPedidoEsquema = new mongoose.Schema({
    producto: {
    //Para guardar el ID único del producto porque si se cambia el nomnre o el precio se desactualiza y no lo pilla
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Producto",                   
    required: true                      
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    precioUnitario: {
        type: Number,
        required: true
    }
})


const pedidoEsquema = new mongoose.Schema({
    mesa:{
        type: Number,
        required: true
    },
    items: [productoPedidoEsquema],
    total:{
        type: Number,
        default: 0
    },
    numPedido:{
        type: Number,
        required: true,
        unique: true
    },      
    estado:{
        type: String,
        enum: ["pendiente","entregado","pagado"],
        default: "pendiente"
    }
})

const mesaEsquema = new mongoose.Schema({
    numero:{
        type:Number,
        required: true,
        unique: true
    },
    nombre:{
        type:String,
        required:true,
        unique:true
    }
    ,
    estado:{
        type: String,
        enum: ["libre","ocupada"],
        default: "libre"
    }
})

//Modelos creados
const Producto = mongoose.model("Producto",productoEsquema);
const Pedido = mongoose.model("Pedido",pedidoEsquema);
const Mesa = mongoose.model("Mesa",mesaEsquema);
const ProductoPedido = mongoose.model("ProductoPedido",productoPedidoEsquema);


app.get("/",(req,res) => {
    res.json({
        message: "¡Servidor funcionando correctamente!",
        endpoints: {
            productos:"/api/productos",
            pedidos:"/api/pedidos",
            mesas:"/api/mesas"
        }
    })
})


//Ruta para obtener todas los productos
app.get("/api/productos",async(req,res)=>{
    try{
        const productos = await Producto.find();
        res.json(productos);
    }
    catch(error){
        console.log("Error al obtener productos",error);
    }
})


//Ruta para obtener todas los pedidos
app.get("/api/pedidos",async(req,res) =>{
    try{
        console.log("Solicitando todos los pedidos... ");
        const pedidos = await pedido.find();
        res.json(pedidos);
    }
    catch(error){
        console.log("Error al obtener pedidos",error);
    }
})

//Ruta para crear nuevo pedido
app.post("/api/pedidos",async(req,res) =>{
    try{
        console.log("Creando nuevo pedido... ", req.body);
        const nuevoPedido = new pedido(req.body);
        await nuevoPedido.save();
    }
    catch(error){
        console.log("Error al obtener pedidos",error);
    }
})


async function crearDatosPrincipales(){
    await Mesa.create([
        {numero:1, nombre:"España"},
        {numero:2, nombre:"Francia"},
        {numero:3, nombre:"Suiza"},
        {numero:4, nombre:"Estados Unidos"},
        {numero:5, nombre:"japón"}
    ]);

    await Producto.create([
        {nombre:"Menú 1 - Clásico Americano",descripcion:"Hamburguesa de ternera con queso cheddar, lechuga, tomate y salsa especial  y ración de patatas fritas",precio: 12.00},
        {nombre:"Menú 2 - BBQ Bacon",descripcion:"Hamburguesa de vacuno con bacon, cheddar y salsa barbacoa con papatas gajo y aros de cebolla", precio: 13.00},
        {nombre:"Menú 3 - Veggie",descripcion:"Hamburguesa vegetal con aguacate y mayonesa de lima con ensalada y chips de batata", precio: 13.50},
        {nombre:"Menú 4 - Pollo Picante",descripcion:"Hamburguesa de pollo crujiente con salsa chipotle con nachos y una ensalda completa", precio: 14.00},
        {nombre:"Bebida 1 - Refresco",descripcion:"Agua + café", precio: 2.00},
        {nombre:"Bebida 2 - Natural",descripcion:"Zumo natural + agua", precio: 3.00},
        {nombre:"Bebida 3 - Premium",descripcion:"Cerveza o Vino", precio: 4.00},

    ])
}







connectarBd();
crearDatosPrincipales();