// Función para realizar el fetch de la API de jugadores
async function fetchPlayers() {
    const apiUrl = "https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=133604";
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Error al obtener datos de la API-jugadores");
        }
        const data = await response.json();
        return data.player; // Devuelve el array de jugadores
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Función para convertir el JSON a JSONlite de jugadores
function convertToJSONlite(players) {
    return players.map(player => ({
        idPlayer: player.idPlayer,
        strRender: player.strRender,
        strPlayer: player.strPlayer,
        strPosition: player.strPosition,
        strTeam: player.strTeam,
        strHeight: player.strHeight,
        strWeight: player.strWeight,
        dateBorn: player.dateBorn,
        strNationality: player.strNationality
    }));
}

// Función para realizar el fetch de la API de partidos
async function fetchGames() {
    const apiUrl = "https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133604";
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Error al obtener datos de la API-partidos");
        }
        const data = await response.json();
        return data.results; // Devuelve el array de partidos
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Función para convertir el JSON a JSONlite de partidos
function convertToJSONliteGames(games) {
    return games.map(game => ({
        idEvent: game.idEvent,
        strEvent: game.strEvent,
        strLeague: game.strLeague,
        strHomeTeam: game.strHomeTeam,
        intHomeScore: game.intHomeScore,
        strAwayTeam: game.strAwayTeam,
        intAwayScore: game.intAwayScore,
        dateEvent: game.dateEvent,
        strVenue: game.strVenue,
        strCountry: game.strCountry
    }));
}

// Función principal para gestionar el fetch y almacenamiento en LocalStorage (jugadores y partidos)
async function initializePlayers() {
    const loadingElement = document.getElementById("loading");

    // Mostrar mensaje de carga
    loadingElement.style.display = "block";

    if (!localStorage.getItem("JSONjugadoresDisponibles")) {
        console.log("Importando datos de jugadores desde API...");
        const players = await fetchPlayers();
        const jugadoresDisponibles = convertToJSONlite(players)
        localStorage.setItem("JSONjugadoresDisponibles", JSON.stringify(jugadoresDisponibles));
    } else {
        console.log("La lista de Jugadores Disponibles ya existe en localStorage, no se importa de API.");
    }

    // Ocultar mensaje de carga
    loadingElement.style.display = "none";

    if (!localStorage.getItem("JSONjugadoresEquipo")) {
        const jugadoresEquipo = [];
        localStorage.setItem("JSONjugadoresEquipo", JSON.stringify(jugadoresEquipo));
    } else {
        console.log("Se carga el equipo preexistente.");
    }

    if (!localStorage.getItem("JSONpartidos")) {
        console.log("Importando datos de partidos desde API...");
        const games = await fetchGames();
        const gamesLite = convertToJSONliteGames(games)
        localStorage.setItem("JSONpartidos", JSON.stringify(gamesLite));
    } else {
        console.log("La lista de partidos ya existe en localStorage, no se importa de API.");
    }

}


// Función para renderizar las cards de los jugadores y los partidos
function renderPlayers() {
    const playersContainer = document.querySelector(".jugadores-container");
    const jugadoresDisponibles = JSON.parse(localStorage.getItem("JSONjugadoresDisponibles"));
    const equipoContainer = document.querySelector(".equipo-container");
    const jugadoresEquipo = JSON.parse(localStorage.getItem("JSONjugadoresEquipo"));
    const partidosContainer = document.querySelector(".partidos-container");
    const partidos = JSON.parse(localStorage.getItem("JSONpartidos"));

    const teamCounterElement = document.getElementById("teamCounter");
    // Mostrar mensaje de equipo vacío
    switch(true) {
        case (jugadoresEquipo.length === 0):
            teamCounterElement.textContent = "No hay jugadores en el equipo. Añadí algunos!";
            break;
        case (jugadoresEquipo.length >=1 && jugadoresEquipo.length <=10):
            teamCounterElement.textContent = `Hay ${jugadoresEquipo.length} jugadores en el equipo, recuerda que el máximo es 11`;
            break;
        case (jugadoresEquipo.length === 11):
            teamCounterElement.textContent = "El equipo está completo. Si quiere cambiar jugadores primero quitá algunos.";
            //Bloquear botones añadir
            break;
    }

    // Mostrar las listas en consola 
    // (solo hago esto porque lo pide la consigna, no es necesario para la funcionalidad del sitio)
    console.log("Lista de jugadores disponibles:")
    console.log(jugadoresDisponibles);
    console.log("Lista de jugadores en el equipo:")
    console.log(jugadoresEquipo);

    // Limpiar el contenedor de jugadores disponibles, de equipo y de partidos 
    equipoContainer.innerHTML = "";
    playersContainer.innerHTML = "";
    partidosContainer.innerHTML = "";

    // Crear una card para cada jugador en equipo
    jugadoresEquipo.forEach(jugador => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.id = jugador.idPlayer;

        card.innerHTML = `
            <img src="${jugador.strRender}" alt="${jugador.strPlayer}">
            <h3>${jugador.strPlayer}</h3>
            <p>Posición: ${jugador.strPosition}</p>
            <p>Equipo: ${jugador.strTeam}</p>
            <p>Altura: ${jugador.strHeight}</p>
            <button data-id="${jugador.idPlayer}" class="btn-remove">Quitar</button>
        `;

        equipoContainer.appendChild(card);
    });

    // Añadir funcionalidad al botón "Quitar"
    document.querySelectorAll(".btn-remove").forEach(button => {
        button.addEventListener("click", () => {
            const jugadorID = button.getAttribute("data-id");
            moverJugador(jugadorID, false);
        });
    });

    // Crear una card para cada jugador en jugadores disponibles
    jugadoresDisponibles.forEach(jugador => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.id = jugador.idPlayer;

        card.innerHTML = `
            <img src="${jugador.strRender}" alt="${jugador.strPlayer}">
            <h3>${jugador.strPlayer}</h3>
            <p>Posición: ${jugador.strPosition}</p>
            <p>Equipo: ${jugador.strTeam}</p>
            <p>Altura: ${jugador.strHeight}</p>
            <button data-id="${jugador.idPlayer}" class="btn-add">Añadir</button>
        `;

        playersContainer.appendChild(card);
    });

    // Añadir funcionalidad al botón "Añadir"
    document.querySelectorAll(".btn-add").forEach(button => {
        button.addEventListener("click", () => {
            const jugadorID = button.getAttribute("data-id");
            moverJugador(jugadorID, true);
        });
    });
            if (jugadoresEquipo.length === 11) {
                //Bloquear botones añadir
                document.querySelectorAll(".btn-add").forEach(button => {
                    button.disabled = true;
                });
            } else {
                //Mostrar botones añadir (por si estaban bloqueados)
                document.querySelectorAll(".btn-add").forEach(button => {
                    button.enabled = true;
                });
            }  

    // Crear una card para cada partido
    partidos.forEach(partido => {
        const card = document.createElement("div");
        card.classList.add("partido");
        card.id = partido.idEvent;
        const fecha = new Date(partido.dateEvent);
        const meses = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre", 
            "diciembre"
        ];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];  // enero = 0
        const anio = fecha.getFullYear();

        card.innerHTML = `
            <h3>${partido.strEvent}</h3>
            <p>Resultado: ${partido.intHomeScore}-${partido.intAwayScore}</p>
            <p>Jugado en ${partido.strVenue}, el ${dia} de ${mes} de ${anio}.</p>
        `;

        partidosContainer.appendChild(card);
    });

}

// Función para actualizar localStorage
const actualizarStorage = (jugadoresDisponibles, jugadoresEquipo) => {
    localStorage.setItem("JSONjugadoresDisponibles", JSON.stringify(jugadoresDisponibles));
    localStorage.setItem("JSONjugadoresEquipo", JSON.stringify(jugadoresEquipo));
};


// Función para mover jugadores entre listas
const moverJugador = (jugadorID, haciaEquipo) => {
    const jugadoresDisponibles = JSON.parse(localStorage.getItem("JSONjugadoresDisponibles"));
    const jugadoresEquipo = JSON.parse(localStorage.getItem("JSONjugadoresEquipo"));

    if (haciaEquipo) {
        const jugadorIndex = jugadoresDisponibles.findIndex(j => j.idPlayer === jugadorID);
        if (jugadorIndex !== -1) {
            const jugador = jugadoresDisponibles.splice(jugadorIndex, 1)[0];
            jugadoresEquipo.push(jugador);
            actualizarStorage(jugadoresDisponibles, jugadoresEquipo);
            renderPlayers();
        }
    } else {
        const jugadorIndex = jugadoresEquipo.findIndex(j => j.idPlayer === jugadorID);
        if (jugadorIndex !== -1) {
            const jugador = jugadoresEquipo.splice(jugadorIndex, 1)[0];
            jugadoresDisponibles.push(jugador);
            actualizarStorage(jugadoresDisponibles, jugadoresEquipo);
            renderPlayers();
        }
    }
};


// Llamar a initializePlayers y renderPlayers, en ese orden, en cuanto está cargado el DOM
document.addEventListener("DOMContentLoaded", async () => {
    await initializePlayers(); // Asegura que el fetch o la validación esté completa
    renderPlayers(); // Renderiza los jugadores solo cuando el listado está disponible
});


