/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 GLOBALES
 */
// TOUTES LES DONNEES
var datas;
// LE TABLEAU SERT A STOCKER LES NOMS POUR ENSUITE ETRE UTILISE POUR LA LISTE DE SUGGESTIONS
var tAdresses = new Array();
var tLatProches;
var tLngProches;
var latStation;
var lngStation;
var latPersonne;
var lngPersonne;

/**
 *
 * @returns {undefined}
 */
function init() {
    var localisation = setInterval(geolocalisation, 10000);
    afficherCarte(48.858565, 2.347198);
    var centreCarte = getCenter();
    console.log(centreCarte);

}

/**
 * 
 * @returns {undefined}
 */
function geolocalisation() {
    console.log("test geoloc")
    if (navigator.geolocation)
        var watchId = navigator.geolocation.watchPosition(successCallback,
                null,
                {enableHighAccuracy: true});
    else
        alert("Votre navigateur ne prend pas en compte la géolocalisation HTML5");

}///fin geolocalisation
function successCallback(position) {
    //panTo centre une coordonnée sur la carte
    map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    
    if (position.coords.accuracy < 100) {
// Affichage du marqueur et du Polyline


        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            map: map
        });
        if (previousPosition) {
            var newLineCoordinates =
                    [
                        new google.maps.LatLng(previousPosition.coords.latitude, previousPosition.coords.longitude),
                        new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
                    ];

            var newLine = new google.maps.Polyline({
                path: newLineCoordinates,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            newLine.setMap(map);
        }
    }
    previousPosition = position;

}


// -------------------------------------------------------------------------------------------------------------------------------------
/**
 * 
 * @param {type} position
 * @returns {undefined}
 */
function obtenirLatEtLong(position) {//
    // --- Latitude
    var latitude = position.coords.latitude;//position geolocalisé
    // --- Longitude
    var longitude = position.coords.longitude;//position geolocalisé
    // La Map
    afficherCarte(latitude, longitude);
} /// obtenirLatEtLong

// --------------------------------------------------------------------------------------------------------------------------------------
/**
 * 
 * @param {type} erreur
 * @returns {undefined}
 */
function echec(erreur) {
    switch (erreur.code) {
        case erreur.TIMEOUT:
            navigator.geolocation.getCurrentPosition(obtenirLatEtLong, echec);
            break;
        case erreur.POSITION_UNAVAILABLE:
            $("#lblMessageMap").html("Position indisponible");
            break;
        case erreur.PERMISSION_DENIED:
            $("#lblMessageMap").html("Permission refusée");
            break;
        case erreur.UNKNOWN_ERROR:
            $("#lblMessageMap").html("Erreur inconnue");
            break;
        default:
            $("#lblMessageMap").html("Echec de l'obtention de coordonnées");
            break;
    }
} /// echec

// --------------------------------------------------------------------------------------------------------------------------------------
/**
 * 
 * @param {type} latitude
 * @param {type} longitude
 * @returns {undefined}
 */
function afficherCarte(latitude, longitude) {//position geolocalisé au lancement de la page sans la recherche par nom ou adresse
    // --- Affiche une carte a latitude, longitude, zoom (De 1 a 20)
    var coordonnees = new google.maps.LatLng(latitude, longitude);

    // --- Les options
    var options = {
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: coordonnees
    };

    // --- La carte
    var carte = new google.maps.Map(document.getElementById("map"), options);

    // --- Un marqueur
    var marqueur = new google.maps.Marker({
        map: carte,
        position: coordonnees

    });

} /// afficherCarte
// --------------------------------------------------------------------------------------------------------------------------------------


/**
 * 
 * @returns {undefined}
 */
function recupererDataVelib() {

    /*
     REQUETE DISTANTE POUR RECUPERER LA LISTE DES STATIONS DE PARIS ET COURONNE
     */
    var jqXHR = $.get(
            //"http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&facet=banking&facet=bonus&facet=status&facet=contract_name",
            //"http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel",
            //"http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=500&facet=banking&facet=bonus&facet=status&facet=contract_name",
            //"http://localhost/ressources/json/stations-velib-disponibilites-en-temps-reel.json",
            "http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=1127&facet=banking&facet=bonus&facet=status&facet=contract_name",
            "json"
            ); /// $.get

    jqXHR.done(function(data) {
        console.log("DONNEES DISTANTES");
//        datas = JSON.parse(data);
        console.log(data);
        datas = data.records;

        for (var i = 0; i < datas.length; i++) {
            var adresse = datas[i].fields.address;
            tAdresses[adresse] = adresse;
        } ///

        // Tri du tableau
        tAdresses.sort();

        //
        $("#pMessage").html("Les données distantes et en temps réel sont disponibles");
    });

    jqXHR.fail(function(xhr, statut, erreur) {
        /*
         REQUETE LOCALE POUR RECUPERER LA LISTE DES STATIONS DE PARIS ET COURONNE
         */
        console.log("Erreur AJAX : " + xhr.status + "-" + xhr.statusText + " : " + statut);
        $("#lblMessage").html(xhr.status + "-" + xhr.statusText);

        console.log("DONNEES LOCALES");

        var jqXHR = $.get(
                //"../php/PaysSelectEnJSON.php",
                //"http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&facet=banking&facet=bonus&facet=status&facet=contract_name",
                //"http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel",
                //"http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=500&facet=banking&facet=bonus&facet=status&facet=contract_name",
                "../ressources/json/stations-velib-disponibilites-en-temps-reel.json",
                "json"
                ); /// $.get

        jqXHR.done(function(data) {
            //console.log(data);
            //datas = data;

            /*
             D'ABORD IL FAUT PARSER PARCE QUE CELA VIENT D'UN FICHIER
             */
            var objetJSON = JSON.parse(data);
            console.log(objetJSON);

            datas = objetJSON;
            // EN LOCAL
//            console.log(datas);
//            console.log(datas[0].fields.position[0]); // lat
//            console.log(objetJSON[0].fields.position[1]); // lng

            for (var i = 0; i < datas.length; i++) {
                var adresse = datas[i].fields.address;
                tAdresses[adresse] = adresse;
            } ///

            // Tri du tableau
            tAdresses.sort();

            //
            $("#pMessage").html("Les données locales et pas en temps réel sont disponibles !!!");
        });
    });
}
// --------------------------------------------------------------------------------------------------------------------------------------



// --------------------
$(document).ready(init);
