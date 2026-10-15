const listaDeVehiculos = [
  {
    id: 1,
    marca: "Toyota",
    modelo: "Yaris",
    anio: 2021,
    tipo: "Hatchback",
    precio: 8990000,
    precioAnterior: null,
    kilometraje: "32.000 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/2021_Toyota_Yaris_ATIV_Sport_Premium_%28Two-Tone%29.jpg",
    colorFondo: "#141416"
  },
  {
    id: 2,
    marca: "Chevrolet",
    modelo: "Sail",
    anio: 2020,
    tipo: "Sedán",
    precio: 7490000,
    precioAnterior: 8190000,
    kilometraje: "41.500 km",
    transmision: "Mecánica",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Chevrolet_Sail.jpg",
    colorFondo: "#e6127d"
  },
  {
    id: 3,
    marca: "Nissan",
    modelo: "Qashqai",
    anio: 2022,
    tipo: "SUV",
    precio: 14990000,
    precioAnterior: null,
    kilometraje: "18.200 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Nissan_Qashqai_%28J12%29_IMG_4897.jpg",
    colorFondo: "#3a3a42"
  },
  {
    id: 4,
    marca: "Ford",
    modelo: "Ranger",
    anio: 2019,
    tipo: "Pickup",
    precio: 16500000,
    precioAnterior: null,
    kilometraje: "58.000 km",
    transmision: "Mecánica",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/2019_Ford_Ranger_XLT_Super_Cab_FX4_front_6.1.19.jpg",
    colorFondo: "#141416"
  },
  {
    id: 5,
    marca: "Hyundai",
    modelo: "Accent",
    anio: 2021,
    tipo: "Sedán",
    precio: 8290000,
    precioAnterior: null,
    kilometraje: "27.800 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai-Accent-GLS-sedan.jpg",
    colorFondo: "#c40e69"
  },
  {
    id: 6,
    marca: "Kia",
    modelo: "Sportage",
    anio: 2020,
    tipo: "SUV",
    precio: 13990000,
    precioAnterior: 15290000,
    kilometraje: "39.400 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Kia_Sportage_%28NQ5%3B_2021%29.jpg",
    colorFondo: "#3a3a42"
  },
  {
    id: 7,
    marca: "Suzuki",
    modelo: "Swift",
    anio: 2022,
    tipo: "Hatchback",
    precio: 9490000,
    precioAnterior: null,
    kilometraje: "12.900 km",
    transmision: "Mecánica",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/2018_Suzuki_Swift_%28AZ%29_GLX_Turbo_5-door_hatchback_%282018-02-20%29_01.jpg",
    colorFondo: "#141416"
  },
  {
    id: 8,
    marca: "Mazda",
    modelo: "3",
    anio: 2021,
    tipo: "Sedán",
    precio: 11990000,
    precioAnterior: null,
    kilometraje: "24.600 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Mazda_3.jpg",
    colorFondo: "#e6127d"
  },
  {
    id: 9,
    marca: "Toyota",
    modelo: "Hilux",
    anio: 2018,
    tipo: "Pickup",
    precio: 15990000,
    precioAnterior: 17490000,
    kilometraje: "72.300 km",
    transmision: "Mecánica",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Hilux_Pickup_4x4_2-door_1987.jpg",
    colorFondo: "#3a3a42"
  },
  {
    id: 10,
    marca: "Chevrolet",
    modelo: "Tracker",
    anio: 2023,
    tipo: "SUV",
    precio: 12490000,
    precioAnterior: null,
    kilometraje: "8.100 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Chevrolet_Tracker_LT_1.8_2014_%2815732033549%29.jpg",
    colorFondo: "#141416"
  },
  {
    id: 11,
    marca: "Peugeot",
    modelo: "208",
    anio: 2020,
    tipo: "Hatchback",
    precio: 7990000,
    precioAnterior: null,
    kilometraje: "35.700 km",
    transmision: "Mecánica",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Peugeot_208_B_IMG_2566.jpg",
    colorFondo: "#c40e69"
  },
  {
    id: 12,
    marca: "Volkswagen",
    modelo: "Vento",
    anio: 2019,
    tipo: "Sedán",
    precio: 9990000,
    precioAnterior: null,
    kilometraje: "48.900 km",
    transmision: "Automática",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen_Vento_2014_Perfil.png",
    colorFondo: "#3a3a42"
  }
];

const listaDeMarcas = [
  "Toyota", "Chevrolet", "Nissan", "Ford", "Hyundai",
  "Kia", "Suzuki", "Mazda", "Peugeot", "Volkswagen"
];

function formatearPrecioClp(numero) {
  return "$" + numero.toLocaleString("es-CL");
}
