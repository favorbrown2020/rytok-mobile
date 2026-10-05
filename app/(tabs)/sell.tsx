import React, { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Image, Alert, KeyboardAvoidingView, Platform, Modal,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem  from "expo-file-system";
import {
    PlusCircle, Tag, MapPin, Camera, Upload, X, ChevronRight,
    ChevronLeft, ArrowLeftRight, Clock, CheckCircle2, Image as ImageIcon,
    Sparkles, Wand2, Zap, RefreshCw, Eye, Pencil,
} from "lucide-react-native";
const DEV_IP = "10.231.174.64"; // hotspot IP

// ─── Colours ─────────────────────────────────────────────────────────────────
const C = {
    primary:       "#6366F1",
    primaryDark:   "#4338CA",
    primarySubtle: "#EEF2FF",
    bg:            "#F8F9FA",
    surface:       "#FFFFFF",
    border:        "#E9ECEF",
    textPrimary:   "#1A1A2E",
    textSecondary: "#6C757D",
    textMuted:     "#ADB5BD",
    success:       "#10B981",
    error:         "#EF4444",
};

const GHANA_REGIONS: {value:string;label:string;districts:string[]}[] = [
    {value:"greater-accra",label:"Greater Accra",districts:["Abeka", "Abelenkpe", "Abese", "Abia", "Abladzi", "Ablekuma", "Ablekuma Fan Milk", "Ablekuma Manhean", "Ablorh Adjei", "Abokobi", "Abossey Okai", "Accra", "Accra Central", "Accra New Town", "Achimota", "Achimota Mile 7", "Achimota Village", "Acoconut", "Action Chapel Area", "Ada Foah", "Adabraka", "Adabraka Sahara", "Addo", "Adedenko", "Adenta", "Adenta Barrier", "Adenta Fafraha", "Adenta Frafraha", "Adenta Housing", "Adenta Market", "Adenta Sakora", "Adjei Kojo", "Adjiriganor", "Adjringanor New Site", "Afariwa", "Afienya", "Agape", "Agbado", "Agbogba", "Agbogbloshie", "Agege", "Ahinsan Estate", "Ahodwo", "Airport Area", "Airport City", "Airport Hills", "Airport Residential", "Airport Residential Area", "Aiyinase", "Ajiringanor", "Akotobabi", "Akra", "Akrofuom", "Akuse", "Akweteman Zongo", "Akweteyman", "Alajo", "Alajo Kokomlemle", "Alogboshie", "Amakom", "Amanfrom", "Amanor Dodoo", "Amansaman", "Amasaman", "Amasaman Fise", "Amasie", "Amomorley", "Amrahia", "Anibi\u025b", "Anloga", "Anobi", "Anyaa", "Anyakpoi", "Anyano", "Apenkwa", "Aplaku", "Appolonia", "Arena", "Ars", "Ashaiman", "Ashaiman Lebanon", "Ashaiman Lebanon Zone 1-6", "Ashaiman Mandela", "Ashaiman Market", "Ashaiman Middle East", "Ashaiman New Town", "Ashaiman Old Town", "Ashaiman Tulaku", "Ashaiman Zenu", "Ashale Botwe", "Ashalley Botwe", "Ashiaman Broadway", "Ashiyie", "Ashongman", "Ashongman Estate", "Ashongman Estates", "Ashongman Gonse", "Ashongman Joma", "Ashongman Village", "Asylum Down", "Atomic", "Atomic Down", "Atomic Energy", "Atomic Junction", "Avenor", "Awoshie", "Awudome", "Ayawaso", "Ayi Mensah", "Ayimensah", "Baatsona", "Baatsona New Town", "Baatsonaa", "Bawaleshi", "Bawaleshie", "Baweleshie", "Big Ada", "Bortianor", "Botianor", "Boundary Road", "Brazil", "Buade", "Bubiashie", "Bubuashie", "Buduburam", "Bukom", "Burma Camp", "CP", "Cantonment", "Cantonments", "Cape Coast Junction", "Castle Road", "Central Accra", "Central Legon", "Chantan", "Chapel Hill", "China Mall Area", "Chorkor", "Christian Village", "Circle", "Circle Odorkor", "City Annex", "Clottey", "Coast Guard", "Cocoa Board", "Coconut Grove", "Community 1", "Community 10", "Community 11", "Community 12", "Community 13", "Community 14", "Community 15", "Community 16", "Community 17", "Community 18", "Community 19", "Community 2", "Community 20", "Community 21", "Community 22", "Community 23", "Community 24", "Community 25", "Community 3", "Community 4", "Community 5", "Community 6", "Community 7", "Community 8", "Community 9", "Cow Lane", "Dadeban", "Dadekotopon", "Danfa", "Dansoman", "Dansoman Exhibition", "Dansoman Flamingo", "Dansoman Keep Fit", "Dansoman Last Stop", "Dansoman Roundabout", "Dansoman Sahara", "Darkuman", "Darkuman Junction", "Darkuman Kokompe", "Darkuman Roman Down", "Dawhenya", "Dodowa", "Doku", "Dome", "Dome Crossing", "Dome GCB", "Dome Kwabenya", "Dome Market", "Dome Pillar 2", "Dopeyyia", "Dzorwulu", "East Adenta", "East Airport", "East Cantonments", "East Dzorwulu", "East Lands", "East Legon", "East Legon Extension", "East Legon Hills", "East Ridge", "Eastland", "Eastlegonhills", "Fadama", "Fanmilk", "Feo Eyeo", "Fise", "Flamingo", "Frafraha", "GCB Estates", "Ga Mashie", "Ga West", "Gamashie", "Gbawe", "Gbawe CP", "Gbawe Gonse", "Gbawe Official Town", "Gbawe Santa Maria", "Gbawe Zero", "Gbegbeyise", "Gbesile", "Gbetsile", "Giffard Road", "Glefe", "Golf City", "Greater Accra", "Greda Estates", "Haatso", "Haatso Atomic Down", "Haatso Bohye", "Haatso Ecomog", "Haatso Papaye", "Haatso Zongo", "Harbour Area", "High Street", "Holy Garden", "India", "Industrial Area", "James Town", "Joma", "Junction Mall Area", "Kabuklaga", "Kakasunanka", "Kanda", "Kanda Estates", "Kaneshie", "Kaneshie Agape", "Kaneshie First Light", "Kaneshie Official", "Kasoa", "Katamanso", "Kawukudi", "Kinkole", "Kisseman", "Kissieman", "Klagon", "Koans Estate", "Koblenzo", "Kokomlemle", "Kokrobite", "Kole Bu", "Korle Bu", "Korle Dudor", "Korle Gonno", "Korle-Wokon", "Korley Klottey", "Kotobabi", "Kotobabi Westhills Mall", "Kotoka International Airport Area", "Kpehe", "Kpeshie", "Kpobiman", "Kpone", "Kpone Barrier", "Kpone-Katamanso", "Kwabenya", "Kwabenya ACP", "Kwabenya Police Station", "Kwabenya Zongo", "Kwashieman", "Kwashieman Roundabout", "Kwashieman Zongo", "La", "La Beach", "La Bone", "La Dadekotopon", "La Nkwantanang", "La Paz", "La Wireless", "Labadi", "Labone", "Lakeside Estate", "Langbiawe", "Lapaz", "Lartebiokorshie", "Lashibi", "Lebanon", "Legon", "Legon Campus", "Legon Hills", "Legon UG", "Lekma", "Lekpongunor", "Lesdons", "Liberation Road", "Lomnava", "Maame Krobo", "Maamobi", "Madina", "Madina ARS", "Madina Atomic Junction", "Madina Estate", "Madina Firestone", "Madina Market", "Madina Ritz", "Madina Social Welfare", "Madina Zongo", "Makola", "Mallam", "Mallam Gbawe", "Mallam Junction", "Mamprobi", "Mamprobi Estate", "Mamprobi Sempe", "Manet", "Mannet", "Manyesim", "Maranatha", "Martey Tsuru", "Mataheko", "Mateheko", "McCarthy Hill", "Medie", "Mempeasem", "Michel Camp", "Mile 7", "Ministries", "Miotso", "Motorway Extension", "Mpoase", "Mustapha", "Neoplan", "New Aplaku", "New Gbawe", "New Legon", "New Town", "Ngleshie Amanfro", "Nii Boi Town", "Nima", "Nima 441", "Nima Highway", "Ningo", "Nmai Dzorn", "Nmaikrom", "North Dzorwulu", "North Industrial Area", "North Kaneshie", "North Labone", "North Legon", "North Ridge", "Nsakina", "Nsawam Road", "Nthc Estates", "Nungua", "Nungua Barrier", "Nungua Coco Beach", "Nungua New Town", "Nungua Old Town", "Nyaniba", "Nyaniba Estates", "Nyanyano", "Obaleh", "Oblogo", "Obra Spot", "Obuasi Camp", "Odorkor", "Odorkor Akwete", "Odorkor Busia", "Odorkor Official Town", "Odorkor Pentecost", "Odorkor Santa Maria", "Odorkor aBlade", "Odorna", "Ofankor", "Ofankor Barrier", "Official Town", "Ogbojo", "Okaikoi North", "Okaikoi South", "Okpoi Gonno", "Okponglo", "Old Ashongman", "Old Barrier", "Old Dansoman", "Old Nungua", "Old Teshie", "Opera Square", "Osu", "Osu Badu", "Osu Cemetery Road", "Osu Kuku Hill", "Osu Oxford Street", "Osu RE", "Otinibi", "Oyarifa", "Oyibi", "Paloma", "Pamprom", "Pantang", "Papao", "Papaye", "Parliament House Area", "Pig Farm", "Pokuase", "Pokuase ACP", "Pokuase Amasaman", "Pokuase Mayera", "Police Academy", "Prampram", "Presec Legon Area", "Quarshie", "Race Course", "Regimanuel", "Regimanuel Gray", "Ridge", "Ridge Roundabout", "Ring Road Central", "Ring Road East", "Ring Road Estates", "Ring Road West", "Ritz", "Roman Ridge", "Russels", "Sabon Zongo", "Sahara", "Sakaman", "Sakora", "Sakumono", "Sakumono Beach", "Sakumono Estates", "Sakumono Village", "Santa Maria", "Santeo", "Sarpeiman", "Sege", "Sempe", "Shai Hills", "Shianor", "Shiashi", "Shiashie", "Sogakope", "South La", "Sowutuom", "Sowutuom CP", "Sowutuom Ofankor", "Sowutuom Official Town", "Spintex", "Spintex Road Area", "State Housing", "Sun City", "Tabora", "Taifa", "Taifa Burkina", "Taki", "Tantra Hills", "Teiman", "Tema", "Tema Comm 1-25", "Tema Fishing Harbour", "Tema Harbour", "Tema Industrial Area", "Tema Main", "Tema Manhean", "Tema New Town", "Tema Newtown", "Tema Station", "Tesano", "Teshie", "Teshie Lekma", "Teshie Nungua Estates", "Teshie Okpoigonno", "Teshie Rasta", "Teshie Tsui Bleoo", "Tetegu", "Texpo", "Timber Market", "Trade Fair", "Traffic Light", "Trassaco", "Tsui Bleoo", "Tsuibleoo", "Tuba", "Tudu", "Tulaku", "University of Ghana", "Ussher Fort Area", "Ussher Town", "VRA", "Villagio", "Waju", "Weija", "Weija Barrier", "West Hills", "West Hills Mall Area", "West Legon", "West Ridge", "Western Salem", "Whitehouse", "Winneba Road", "Yooway", "Yooway Estates", "Zenu", "Zero (Gbawe)", "Zongo Junction", "Zongo Laka", "Zoo", "Zoological Gardens Area"]},
    {value:"ashanti",label:"Ashanti",districts:["Aboabo", "Abofour", "Abuakwa", "Adankwame", "Adum", "Agogo", "Agona Ashanti", "Agroyesum", "Ahenkro", "Ahodwo", "Akwatia Line", "Antoa", "Anwiankwanta", "Asafo", "Asawasi", "Ash Town", "Asokore", "Asokore Mampong", "Asokwa", "Asuyeboa", "Ayeduase", "Ayigya", "Bantama", "Barekese", "Bekwai", "Besease", "Bomso", "Brahabebome", "Breman", "Buokrom", "Daaban", "Dichemso", "Dominase", "Eduabin", "Edwenase", "Effiduase", "Ejisu", "Essumeja", "Fante New Town", "Foase", "Fumesua", "Jacobu", "Jamasi", "Juansa", "KNUST", "Kenyaasi", "Kofiase", "Kokofu", "Komfo Anokye", "Konongo", "Kotei", "Krapa", "Krofrom", "Kronum", "Kunka", "Kwadaso", "Kwamo", "Kwanwoma", "Mampong", "Mamponteng", "Mankranso", "Manso Adubia", "Manso Nkwanta", "Namong", "Nhyiaeso", "Nkawie", "Nzema", "Obuasi", "Obuasi Estate", "Odumase", "Offinso", "Onwe", "Patasi", "Santasi", "Sawaba", "Sepe Tinpom", "Sokoban", "Suame", "Tafo", "Tarkwa Maakro", "Tepa", "Toase", "Trede", "Tutuuka", "Wawasi"]},
    {value:"western",label:"Western",districts:["Aboso", "Abuesi", "Agona Nkwanta", "Agyaikrom", "Akwaabadu", "Anaji", "Apowa", "Asankragua", "Asiama", "Atieku", "Axim", "Ayinase", "Bamiankor", "Bawdie", "Bogoso", "Bonyere", "Busua", "Daboase", "Dixcove", "Dompim", "Effiakuma", "Eikwe", "Elubo", "Essipon", "Eweku", "Half Assini", "Huni Valley", "Inchaban", "Kansaworodo", "Kikam", "Kojokrom", "Kwesimintsim", "Manso", "Manso Amenfi", "Market Circle", "Mpohor", "New Takoradi", "Nkroful", "Nsuaem", "Prestea", "Samaboi", "Sekondi", "Shama", "Takoradi", "Tarkwa", "Tikobo No. 1", "Tikobo No. 2", "Wassa Akropong", "Yabiw"]},
    {value:"central",label:"Central",districts:["Abrem Agona", "Abura", "Abura Dunkwa", "Agona Swedru", "Ajumako", "Anomabo", "Anyinabrim", "Apam", "Asebu", "Assin Bereku", "Assin Foso", "Assin Manso", "Assin Praso", "Awutu Bereku", "Ayanfuri", "Bawjiase", "Bisease", "Bobikuma", "Brakwa", "Breman Asikuma", "Buduburam", "Cape Coast", "Dago", "Dawurampong", "Diaso", "Dominase", "Duakwa", "Dunkwa-on-Offin", "Ekon", "Elmina", "Enyan Abaasa", "Essarkyir", "Gomoa Afransi", "Hemang", "Iron City", "Jukwa", "Kakumdo", "Kasoa", "Kissi", "Komenda", "Kwanyako", "Kyekyewere", "Mankessim", "Moree", "Mumford", "Nsaba", "Nsuaem Kyekyewere", "Nyakrom", "Nyankumasi Ahenkro", "Odoben", "Okyereko", "Opeikuma", "Otuam", "Pedu", "Pomadze", "Potsin", "Saltpond", "Senya Beraku", "Twifo Praso", "University Area", "Winneba", "Yamoransa"]},
    {value:"eastern",label:"Eastern",districts:["Abetifi", "Abiriw", "Abompe", "Abonsi", "Abosamanso", "Abreshia", "Aburi", "Achiase", "Adeiso", "Adoagyiri", "Adweso", "Afosu", "Agormanya", "Agya Tawia", "Ahwerease", "Akanteng", "Akim Oda", "Akim Swedru", "Akorabo", "Akorley", "Akosombo", "Akropong", "Akroso", "Akuse", "Akwatia", "Akyem Tafo", "Amanase", "Amaniampong", "Amanokrom", "Anum", "Apapam", "Aperade", "Apirede", "Asamankese", "Asawase", "Asene", "Aseseeso", "Asesewa", "Asikam", "Asokore", "Asuom", "Atensoo", "Atimpoku", "Awaham", "Awuah Domasi", "Awukugua", "Ayinase", "Ayirebi", "Begoro", "Berekuso", "Boadua", "Boso", "Coaltar", "Dademantse", "Dawu", "Djankrom", "Dokrochiwa", "Effiduase", "Fodoa", "Gyankama", "Gyiakiti", "Hemang", "Huenya", "Juaben", "Jumapo", "Kade", "Koforidua", "Kotoso", "Kpong", "Kraboa", "Kukurantumi", "Kusi", "Kwahu Tafo", "Kyebi", "Larteh", "Mamfe", "Mampong Akuapem", "Mepom", "Mpraeso", "New Abirem", "New Tafo", "Nkawkaw", "Nkurakan", "Nkwatia", "Noyem", "Nsakye", "Nsawam", "Nsutam", "Ntankro", "Obo", "Obodan", "Obomeng", "Odumase Krobo", "Ofoase", "Okorase", "Osiem", "Osino", "Oterkpolu", "Otumi", "Oworam", "Oyoko", "Sekengsi", "Senchi", "Somanya", "Suhum", "Sutri", "Takrowase", "Topremang", "Tutu", "Wirenkyiren", "Zongo"]},
    {value:"northern",label:"Northern",districts:["Aboabo", "Bimbila", "Changli", "Choggu", "Gbanyamase", "Gumani", "Gurugu", "Gushegu", "Jisonayili", "Kakpayili", "Kalpohin", "Kanvilli", "Karaga", "Kpandai", "Kumbungu", "Lamashegu", "Nanton", "Nyankpala", "Nyanshegu", "Pong-Tamale", "Saboba", "Sabonjida", "Sagnarigu", "Sang", "Savelugu", "Tamale Central", "Tatale", "Tolon", "Vittin", "Wulensi", "Yendi", "Zabzugu"]},
    {value:"upper-east",label:"Upper East",districts:["Bawku", "Binduri", "Bolgatanga", "Bongo", "Chiana", "Fumbisi", "Garu", "Nangodi", "Navrongo", "Paga", "Pusiga", "Sandema", "Sumbrungu", "Tempane", "Tongo", "Zebilla", "Zuarungu"]},
    {value:"upper-west",label:"Upper West",districts:["Bamahu", "Bulenga", "Funsi", "Gwollu", "Issa", "Jirapa", "Kaleo", "Kpongu", "Lambussie", "Lawra", "Nadowli", "Nandom", "Sing", "Tumu", "Wa", "Wechiau"]},
    {value:"volta",label:"Volta",districts:["Abutia", "Adaklu Waya", "Adidome", "Aflao", "Agbozume", "Ahoe", "Akatsi", "Alakple", "Anfoega", "Anloga", "Ave Dakpa", "Bankoe", "Battor", "Denu", "Dome", "Dzelukope", "Dzodze", "Dzolokpuita", "Gbi-Wegbe", "Heve", "Ho", "Hohoe", "Juapong", "Keta", "Kpando", "Kpetoe", "Kpeve", "Mepe", "Peki", "Penyi", "Sogakope", "Tsito", "Vakpo", "Ve Golokwati", "Woe"]},
    {value:"brong-ahafo",label:"Bono",districts:["Abesim", "Badu", "Banda Ahenkro", "Berekum", "Chiraa", "Dormaa Ahenkro", "Drobo", "Fiapre", "Japekrom", "Jinijini", "Kato", "Nkrankwanta", "Nsawkaw", "Nsoatre", "Odomase", "Sampa", "Sunyani", "Wamfie", "Wenchi"]},
    {value:"bono-east",label:"Bono East",districts:["Amantin", "Atebubu", "Aworowa", "Busunya", "Jema", "Kajaji", "Kenten", "Kintampo", "Kwame Danso", "Nkoranza", "Prang", "Techiman", "Tuobodom", "Yeji"]},
    {value:"ahafo",label:"Ahafo",districts:["Bechem", "Bomaa", "Duayaw Nkwanta", "Goaso", "Hwidiem", "Kenyasi", "Kukuom", "Mim"]},
    {value:"western-north",label:"Western North",districts:["Akontombra", "Anhwiaso", "Asafo", "Bekwai", "Bibiani", "Boako", "Bodi", "Dadieso", "Enchi", "Essam", "Juaboso", "Oseikojokrom", "Sefwi Camp", "Wiawso"]},
    {value:"oti",label:"Oti",districts:["Asato", "Chinderi", "Dambai", "Jasikan", "Kadjebi", "Kete Krachi", "Kpassa", "Likpe", "Nkonya", "Nkwanta", "Santrokofi"]},
    {value:"north-east",label:"North East",districts:["Bunkpurugu", "Chereponi", "Gambaga", "Nakpanduri", "Nalerigu", "Walewale", "Yagaba", "Yunyoo"]},
    {value:"savannah",label:"Savannah",districts:["Bole", "Buipe", "Daboya", "Damongo", "Kpalbe", "Salaga", "Sawla", "Tuna"]},
];

const YEARS = Array.from({length:40},(_,i)=>String(new Date().getFullYear()-i));

// ─── Local Drilldown Data (DD) ─────────────────────────────────────────────
const DD: Record<string,any> = {
    "mobile-phones": { subcategories: [
        { id:"smartphones", label:"Smartphones", brands:[
                { id:"apple", label:"Apple", models:["iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17 Air", "iPhone 17", "iPhone 17e", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13 mini", "iPhone 13", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12 mini", "iPhone 12", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11", "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X", "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7", "iPhone 6s Plus", "iPhone 6s", "iPhone 6 Plus", "iPhone 6", "iPhone SE (3rd Gen)", "iPhone SE (2nd Gen)", "iPhone SE (1st Gen)", "iPhone 5s", "iPhone 5c", "iPhone 5", "iPhone 4s", "iPhone 4", "iPhone 3GS", "iPhone 3G", "iPhone (Original)"] },
                { id:"samsung", label:"Samsung", models:["Galaxy S26 Ultra", "Galaxy S26+", "Galaxy S26", "Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S24 FE", "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23", "Galaxy S23 FE", "Galaxy S22 Ultra", "Galaxy S22+", "Galaxy S22", "Galaxy S21 Ultra", "Galaxy S21+", "Galaxy S21", "Galaxy S21 FE", "Galaxy S20 / S20 5G", "Galaxy S20 Ultra", "Galaxy S20+", "Galaxy S20 FE", "Galaxy S10", "Galaxy S10+", "Galaxy S10e", "Galaxy S10 Lite", "Galaxy S9", "Galaxy S9+", "Galaxy S8", "Galaxy S8+", "Galaxy S7", "Galaxy S7 Edge", "Galaxy S6", "Galaxy S6 Edge", "Galaxy S5", "Galaxy S4", "Galaxy S3", "Galaxy S2", "Galaxy S (Original)", "Galaxy Z Fold 7", "Galaxy Z Flip 7", "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Galaxy Z Fold 5", "Galaxy Z Flip 5", "Galaxy Z Fold 4", "Galaxy Z Flip 4", "Galaxy Z Fold 3", "Galaxy Z Flip 3", "Galaxy Fold", "Galaxy Note 20 Ultra", "Galaxy Note 20", "Galaxy Note 10+", "Galaxy Note 10", "Galaxy Note 9", "Galaxy Note 8", "Galaxy Note 7 (FE)", "Galaxy Note 5", "Galaxy Note 4", "Galaxy Note 3", "Galaxy Note 2", "Galaxy Note (Original)", "Galaxy A56", "Galaxy A55", "Galaxy A54", "Galaxy A53", "Galaxy A52s", "Galaxy A52", "Galaxy A51", "Galaxy A50", "Galaxy A36", "Galaxy A35", "Galaxy A34", "Galaxy A33", "Galaxy A32", "Galaxy A31", "Galaxy A30", "Galaxy A16", "Galaxy A15", "Galaxy A14", "Galaxy A13", "Galaxy A12", "Galaxy A11", "Galaxy A10", "Galaxy A06", "Galaxy A05s", "Galaxy A05", "Galaxy A04s", "Galaxy A04", "Galaxy A03s", "Galaxy A03", "Galaxy M55", "Galaxy M54", "Galaxy M53", "Galaxy M35", "Galaxy M34", "Galaxy M15"] },
                { id:"google", label:"Google Pixel", models:["Pixel 10 Pro XL", "Pixel 10 Pro", "Pixel 10", "Pixel 10a", "Pixel 10 Pro Fold", "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 9a", "Pixel 9 Pro Fold", "Pixel 8 Pro", "Pixel 8", "Pixel 8a", "Pixel Fold", "Pixel 7 Pro", "Pixel 7", "Pixel 7a", "Pixel 6 Pro", "Pixel 6", "Pixel 6a", "Pixel 5", "Pixel 5a", "Pixel 4 XL", "Pixel 4", "Pixel 4a (5G)", "Pixel 4a", "Pixel 3 XL", "Pixel 3", "Pixel 3a XL", "Pixel 3a", "Pixel 2 XL", "Pixel 2", "Pixel XL", "Pixel (Original)"] },
                { id:"xiaomi", label:"Xiaomi / Redmi / Poco", models:["Xiaomi 15 Ultra", "Xiaomi 15 Pro", "Xiaomi 15", "Xiaomi 14T Pro", "Xiaomi 14T", "Xiaomi 14 Ultra", "Xiaomi 14 Pro", "Xiaomi 14", "Xiaomi 13 Ultra", "Xiaomi 13 Pro", "Xiaomi 13", "Xiaomi 13T Pro", "Xiaomi 13T", "Xiaomi 12S Ultra", "Xiaomi 12 Pro", "Xiaomi 12", "Xiaomi 12T Pro", "Xiaomi 12T", "Mi 11 Ultra", "Mi 11 Pro", "Mi 11", "Mi 11 Lite 5G", "Mi 10 Ultra", "Mi 10 Pro", "Mi 10", "Mi 10T Pro", "Mi 10T", "Mi 9 Pro", "Mi 9", "Mi 9 Explorer", "Mi 9 SE", "Mi 9T Pro", "Mi 8", "Mi 6", "Mi Mix Fold 4", "Mi Mix Flip", "Mi Mix Alpha", "Redmi Note 15 Pro+", "Redmi Note 15 Pro", "Redmi Note 15", "Redmi Note 14 Pro+", "Redmi Note 14 Pro", "Redmi Note 14", "Redmi Note 13 Pro+", "Redmi Note 13 Pro", "Redmi Note 13", "Redmi Note 12 Pro+", "Redmi Note 12 Pro", "Redmi Note 12", "Redmi Note 11 Pro+", "Redmi Note 11 Pro", "Redmi Note 11", "Redmi Note 11S", "Redmi Note 10 Pro", "Redmi Note 10", "Redmi Note 10S", "Redmi Note 9 Pro", "Redmi Note 9", "Redmi Note 9S", "Redmi Note 8 Pro", "Redmi Note 8", "Redmi Note 7 Pro", "Redmi Note 7", "Redmi Note 6 Pro", "Redmi Note 5 Pro", "Redmi Note 4", "Redmi Note 3", "Redmi 14C", "Redmi 13C", "Redmi 12", "Redmi 12C", "Redmi 10", "Redmi 10C", "Redmi 9", "Redmi 9C", "Redmi 9A", "Redmi 8", "Redmi 8A", "Redmi 7", "Redmi 7A", "Redmi A3", "Redmi A2", "Redmi A1", "Poco F8 Ultra", "Poco F8 Pro", "Poco F8", "Poco F7 Pro", "Poco F6 Pro", "Poco F6", "Poco F5 Pro", "Poco F5", "Poco F4 GT", "Poco F4", "Poco F3", "Poco F2 Pro", "Pocophone F1", "Poco X7 Pro", "Poco X7", "Poco X6 Pro", "Poco X6", "Poco X5 Pro", "Poco X5", "Poco X4 Pro", "Poco X3 Pro", "Poco X3 NFC", "Poco X3", "Poco X2", "Poco M7 Pro", "Poco M6 Pro", "Poco M6", "Poco M5s", "Poco M5", "Poco M4 Pro", "Poco M3 Pro", "Poco M3"] },
                { id:"oppo", label:"Oppo / Find / Reno", models:["Find X8 Ultra", "Find X8 Pro", "Find X8", "Find X7 Ultra", "Find X7 Pro", "Find X7", "Find X6 Pro", "Find X6", "Find X5 Pro", "Find X5", "Find X3 Pro", "Find X3", "Find X2 Pro", "Find X2", "Find N5", "Find N3", "Find N3 Flip", "Find N2", "Find N2 Flip", "Find N", "Reno 14 Pro", "Reno 14", "Reno 13 Pro", "Reno 13", "Reno 12 Pro", "Reno 12", "Reno 12 F", "Reno 11 Pro", "Reno 11", "Reno 11 F", "Reno 10 Pro+", "Reno 10 Pro", "Reno 10", "Reno 9 Pro+", "Reno 8 Pro", "Reno 8", "Reno 7 Pro", "Reno 7", "Reno 6 Pro", "Reno 6", "Reno 5 Pro", "Reno 5", "Reno 4 Pro", "Reno 4", "Reno 3 Pro", "Reno 3", "Reno 2", "Reno 2 F", "Reno 2 Z", "Reno (Original)", "A98", "A96", "A95", "A94", "A93", "A79", "A78", "A77", "A76", "A60", "A59", "A58", "A57", "A54", "A53", "A38", "A18", "A17", "A16", "A15", "A12", "A5", "A3"] },
                { id:"vivo", label:"Vivo", models:["X200 Ultra", "X200 Pro", "X200", "X100 Ultra", "X100 Pro", "X100", "X100s Pro", "X90 Pro+", "X90 Pro", "X90", "X80 Pro", "X80", "X70 Pro+", "X70 Pro", "X70", "X60 Pro+", "X60 Pro", "X60", "X Fold 3 Pro", "X Fold 3", "X Flip", "V50 Pro", "V50", "V40 Pro", "V40", "V30 Pro", "V30", "V30e", "V29 Pro", "V29", "V29e", "V27 Pro", "V27", "V25 Pro", "V25", "V23 Pro", "V23", "V21 5G", "V21", "V20 Pro", "V20", "V19", "V17 Pro", "V15 Pro", "V15", "Y300 Pro", "Y200 Pro", "Y200", "Y100", "Y100i", "Y78 5G", "Y58 5G", "Y38 5G", "Y28 5G", "Y28", "Y18", "Y18e", "Y17s", "Y16", "Y15s", "Y12s", "Y11 (2019)", "Y03", "Y02s"] },
                { id:"oneplus", label:"OnePlus", models:["OnePlus 15 Ultra", "OnePlus 15 Pro", "OnePlus 15", "OnePlus 13 Ultra", "OnePlus 13 Pro", "OnePlus 13", "OnePlus 13R", "OnePlus 12", "OnePlus 12R", "OnePlus 11", "OnePlus 11R", "OnePlus 10 Pro", "OnePlus 10T", "OnePlus 10R", "OnePlus 9 Pro", "OnePlus 9", "OnePlus 9RT", "OnePlus 9R", "OnePlus 8 Pro", "OnePlus 8", "OnePlus 8T", "OnePlus 7T Pro", "OnePlus 7T", "OnePlus 7 Pro", "OnePlus 7", "OnePlus 6T", "OnePlus 6", "OnePlus 5T", "OnePlus 5", "OnePlus 3T", "OnePlus 3", "OnePlus 2", "OnePlus One", "OnePlus Open 2", "OnePlus Open", "Nord 5", "Nord 4", "Nord 3", "Nord 2T", "Nord 2", "Nord CE 4", "Nord CE 4 Lite", "Nord CE 3", "Nord CE 3 Lite", "Nord N30", "Nord N20", "Nord N10"] },
                { id:"honor", label:"Honor", models:["Magic 8 Pro", "Magic 8", "Magic 7 Pro", "Magic 7 RSR", "Magic V3", "Magic Vs3", "Magic 6 Pro", "Honor 300 Pro", "Honor 300", "Honor 200 Pro", "Honor 200", "X9c", "X8c"] },
                { id:"realme", label:"Realme", models:["GT 7 Pro", "GT 6 Pro", "GT 6", "GT 6T", "GT 5 Pro", "GT 5", "GT 2 Pro", "GT 2", "GT Neo 6", "GT Neo 5", "GT Neo 3", "GT Neo 2", "GT Master Edition", "Realme 14 Pro+", "Realme 14 Pro", "Realme 14", "Realme 13 Pro+", "Realme 13 Pro", "Realme 13", "Realme 13+ 5G", "Realme 12 Pro+", "Realme 12 Pro", "Realme 12", "Realme 12x 5G", "Realme 11 Pro+", "Realme 11 Pro", "Realme 11", "Realme 11x 5G", "Realme 10 Pro+", "Realme 10 Pro", "Realme 10", "Realme 9 Pro+", "Realme 9 Pro", "Realme 9", "Realme 9i", "Realme 8 Pro", "Realme 8", "Realme 7 Pro", "Realme 7", "Realme 6 Pro", "Realme 6", "Realme 5 Pro", "Realme 5", "Realme 3 Pro", "Realme 2 Pro", "Realme 1", "Narzo 70 Pro", "Narzo 70 Turbo", "Narzo 60 Pro", "Narzo 50 Pro", "Narzo 30", "C75", "C67", "C65", "C63", "C61", "C55", "C53", "C51", "C35", "C33", "C31", "C30", "C25", "C21", "C11", "C3", "C2"] },
                { id:"huawei", label:"Huawei", models:["Mate XT Ultimate Design (Tri-Fold)", "Pura 80 Ultra", "Pura 80 Pro+", "Pura 80 Pro", "Pura 80", "Pura 70 Ultra", "Pura 70 Pro+", "Pura 70 Pro", "Pura 70", "P60 Pro", "P60 Art", "P50 Pro", "P50 Pocket", "P40 Pro+", "P40 Pro", "P40", "P30 Pro", "P30", "P20 Pro", "P20", "P10 Plus", "P10", "Mate 70 Pro+", "Mate 70 Pro", "Mate 70", "Mate 60 Pro+", "Mate 60 Pro", "Mate 60", "Mate 50 Pro", "Mate 50", "Mate 40 Pro+", "Mate 40 Pro", "Mate 30 Pro", "Mate 20 Pro", "Mate 10 Pro", "Mate X6", "Mate X5", "Mate X3", "Mate Xs 2", "Nova 13 Pro", "Nova 13", "Nova 12 Pro", "Nova 12", "Nova 12i", "Nova 11 Pro", "Nova 11", "Nova 11i", "Nova 10 Pro", "Nova 10", "Nova 10 SE", "Nova 9 Pro", "Nova 9", "Nova 9 SE", "Nova 8 Pro", "Nova 8", "Nova 7 Pro", "Nova 7", "Nova 5T", "Nova 3i", "Nova 2", "Y9 Prime", "Y9 (2019)", "Y8p", "Y7p", "Y7 Prime", "Y6p", "Y6 Prime", "Y5p"] },
                { id:"motorola", label:"Motorola", models:["Razr 60 Ultra", "Razr 60", "Razr 50 Ultra", "Razr 50", "Razr 40 Ultra", "Razr 40", "Razr (2022)", "Razr 5G", "Razr (2019)", "Droid Razr (Heritage)", "Edge 60 Ultra", "Edge 60 Pro", "Edge 60", "Edge 50 Ultra", "Edge 50 Pro", "Edge 50 Fusion", "Edge 40 Pro", "Edge 40", "Edge 30 Ultra", "Edge 30 Pro", "Edge 20 Pro", "Edge Plus", "Moto G100", "Moto G200", "Moto G85", "Moto G84", "Moto G75", "Moto G73", "Moto G64", "Moto G54", "Moto G55", "Moto G Power (2024)", "Moto G Stylus (2024)", "Moto G Fast", "Moto G Play", "Moto G (9th Gen)", "Moto G (8th Gen)", "Moto G (1st Gen Heritage)"] },
                { id:"nothing", label:"Nothing", models:["Phone (3)", "Phone (3a) Pro", "Phone (3a)", "Phone (2a) Plus", "Phone (2a)", "Phone (2)"] },
                { id:"asus", label:"Asus", models:["ROG Phone 9 Pro", "ROG Phone 9", "ROG Phone 8 Pro", "ROG Phone 8", "ROG Phone 7 Ultimate", "ROG Phone 7", "ROG Phone 6 Pro", "ROG Phone 6", "ROG Phone 5s Pro", "ROG Phone 5", "ROG Phone 3", "ROG Phone 2", "ROG Phone (Original)", "Zenfone 11 Ultra", "Zenfone 10", "Zenfone 9", "Zenfone 8", "Zenfone 8 Flip", "Zenfone 7 Pro", "Zenfone 6", "Zenfone 5Z"] },
                { id:"sony", label:"Sony", models:["Xperia 1 VII", "Xperia 1 VI", "Xperia 1 V", "Xperia 1 IV", "Xperia 1 III", "Xperia 1 II", "Xperia 1", "Xperia 5 VI", "Xperia 5 V", "Xperia 5 IV", "Xperia 5 III", "Xperia 5 II", "Xperia 5", "Xperia 10 VII", "Xperia 10 VI", "Xperia 10 V", "Xperia 10 IV", "Xperia 10 III", "Xperia 10 II", "Xperia 10", "Xperia Pro-I", "Xperia Pro", "Xperia Z5 Premium", "Xperia Z5", "Xperia Z3", "Xperia Z2", "Xperia Z1"] },
                { id:"infinix", label:"Infinix", models:["Zero Flip", "Zero 40 5G", "Zero 40", "Zero 30 5G", "Zero 30", "Zero 20", "Zero Ultra", "Zero 5G", "Zero X Pro", "Zero X", "Zero X Neo", "Zero 8", "Zero 8i", "Zero 6", "Zero 5", "Zero 4", "Zero 3", "Zero 2", "Note 60 Pro", "Note 60", "Note 50 Pro", "Note 50", "Note 40 Pro+", "Note 40 Pro", "Note 40", "Note 40X", "Note 30 Pro", "Note 30", "Note 30 5G", "Note 30 VIP", "Note 12 Pro", "Note 12 VIP", "Note 12", "Note 11 Pro", "Note 11", "Note 10 Pro", "Note 10", "Note 8", "Note 8i", "Note 7", "Note 7 Lite", "Note 6", "Note 5", "Note 4", "Note 3", "Note 2", "Hot 60 Pro", "Hot 60", "Hot 50 Pro+", "Hot 50 Pro", "Hot 50", "Hot 50i", "Hot 40 Pro", "Hot 40", "Hot 40i", "Hot 30", "Hot 30i", "Hot 30 Play", "Hot 20", "Hot 20i", "Hot 20 Play", "Hot 12", "Hot 12 Play", "Hot 12i", "Hot 11", "Hot 11S", "Hot 10", "Hot 10S", "Hot 10T", "Hot 10 Lite", "Hot 10i", "Hot 9", "Hot 9 Play", "Hot 8", "Hot 8 Lite", "Hot 7", "Hot 7 Pro", "Hot 6", "Hot 5", "Hot 4", "Hot 3", "Smart 10", "Smart 9", "Smart 9 HD", "Smart 8 Pro", "Smart 8", "Smart 8 HD", "Smart 7", "Smart 7 HD", "Smart 6", "Smart 6 Plus", "Smart 6 HD", "Smart 5", "Smart 4", "Smart 3", "Smart 2", "GT 30 Pro", "GT 20 Pro"] },
                { id:"tecno", label:"Tecno", models:["Phantom V Fold 2", "Phantom V Flip 2", "Phantom V Fold", "Phantom V Flip", "Phantom X2 Pro", "Phantom X2", "Phantom X", "Phantom 9", "Phantom 8", "Phantom 6 Plus", "Phantom 6", "Phantom 5", "Camon 50 Ultra", "Camon 50", "Camon 40 Premier", "Camon 40 Pro", "Camon 40", "Camon 30 Premier", "Camon 30 Pro", "Camon 30", "Camon 30 5G", "Camon 30S", "Camon 20 Premier", "Camon 20 Pro", "Camon 20", "Camon 19 Pro", "Camon 19", "Camon 19 Neo", "Camon 18 Premier", "Camon 18P", "Camon 18", "Camon 18i", "Camon 17 Pro", "Camon 17", "Camon 17P", "Camon 16 Premier", "Camon 16 Pro", "Camon 16", "Camon 16S", "Camon 15 Pro", "Camon 15", "Camon 15 Air", "Camon 15 Premier", "Camon 12 Pro", "Camon 12", "Camon 12 Air", "Camon 11 Pro", "Camon 11", "Camon X Pro", "Camon X", "Camon CX", "Camon CX Air", "Camon C9", "Camon C8", "Camon C7", "Camon C5", "Spark 50 5G", "Spark 50", "Spark 40 Pro+", "Spark 40 Pro", "Spark 40", "Spark 40C", "Spark 30 Pro", "Spark 30", "Spark 30 5G", "Spark 30C", "Spark 20 Pro+", "Spark 20 Pro", "Spark 20", "Spark 20C", "Spark 10 Pro", "Spark 10", "Spark 10C", "Spark 9 Pro", "Spark 9T", "Spark 9", "Spark 8 Pro", "Spark 8C", "Spark 8P", "Spark 8", "Spark 7 Pro", "Spark 7", "Spark 7P", "Spark 6", "Spark 6 Go", "Spark 5 Pro", "Spark 5", "Spark 5 Air", "Spark 4", "Spark 4 Lite", "Spark 3 Pro", "Spark 3", "Spark 2", "Pova 7 Pro", "Pova 7", "Pova 7 Ultra", "Pova Curve 2", "Pova Curve", "Pova 6 Pro", "Pova 6", "Pova 6 Neo", "Pova 5 Pro", "Pova 5", "Pova 4 Pro", "Pova 4", "Pova 3", "Pova 2", "Pova Neo 3", "Pova Neo 2", "Pova Neo", "Pova 5G", "Pova (Original)"] },
                { id:"itel", label:"Itel", models:["S26 Ultra", "S26 Pro", "S26", "S25 Ultra", "S25 Pro", "S24", "P65", "P55+", "A90", "A70"] },
                { id:"nokia", label:"Nokia / HMD", models:["HMD Skyline", "HMD Fusion", "HMD Crest", "Nokia XR21", "Nokia XR20", "Nokia X30", "Nokia X20", "Nokia X10", "Nokia G60 5G", "Nokia G50", "Nokia G42", "Nokia G22", "Nokia G21", "Nokia G11", "Nokia C32", "Nokia C31", "Nokia C22", "Nokia C21 Plus", "Nokia C12", "Nokia 9 PureView", "Nokia 8.3 5G", "Nokia 7.2", "Nokia 6.1", "Nokia 3310 (4G)", "Nokia 8110 (4G)", "Nokia 5710 XpressAudio"] },
                { id:"meizu", label:"Meizu", models:["Lucky 08", "Meizu 21 Pro", "Meizu 21", "Meizu 20 Infinity", "Meizu 18s", "Meizu 17", "Meizu 16s"] },
                { id:"zte", label:"ZTE / Nubia", models:["Nubia Z70 Ultra", "Nubia Z60 Ultra", "Red Magic 10 Pro+", "Red Magic 9 Pro", "Axon 60 Ultra", "Axon 50", "Blade V60", "Blade A75"] },
                { id:"tcl", label:"TCL / Alcatel", models:["TCL 50 XL NxtPaper", "TCL 50 XE", "TCL 40 NxtPaper", "TCL 30 V 5G", "Alcatel 1S", "Alcatel 3X"] },
                { id:"blackview", label:"Blackview", models:["BL9000 Pro", "BV9300", "BV8900", "A200 Pro", "Shark 8", "Oscal Tiger 12"] },
                { id:"oukitel", label:"Oukitel", models:["WP30 Pro", "WP19", "WP21", "RT7 Titan", "C36"] },
                { id:"umidigi", label:"Umidigi", models:["Bison 2 Pro", "Bison GT2", "A15 Pro", "F3 Pro", "G5 Mecha"] },
                { id:"doogee", label:"Doogee", models:["V30 Pro", "V Max", "S110", "N50", "T30 Pro"] },
            { id:"other-brand", label:"Other Brand", models:["Other Model"] },
        ]},
        { id:"feature-phones", label:"Feature Phones", brands:[
            { id:"nokia-fp",  label:"Nokia / HMD", models:["Nokia 105","Nokia 110","Nokia 130","Nokia 150","Nokia 215","Nokia 225","Nokia 3310","Nokia 8110","Other Nokia"] },
            { id:"tecno-fp",  label:"Tecno",        models:["Tecno T301","Tecno T312","Tecno T372","Tecno T474","Other Tecno"] },
            { id:"itel-fp",   label:"Itel",         models:["Itel it2163","Itel it2173","Itel it9200","Itel IT5020","Other Itel"] },
            { id:"samsung-fp",label:"Samsung",      models:["Samsung B310E","Samsung Metro","Samsung Guru","Other Samsung"] },
        ]},
    ]},
    "laptops": { subcategories: [
        { id:"laptops", label:"Laptops", brands:[
                { id:"apple", label:"Apple MacBook", models:["MacBook Pro 16\" (M5 Pro / M5 Max, 2025/2026)", "MacBook Pro 16\" (M4 Pro / M4 Max, 2024)", "MacBook Pro 16\" (M3 Pro / M3 Max, 2023)", "MacBook Pro 16\" (M2 Pro / M2 Max, 2023)", "MacBook Pro 16\" (M1 Pro / M1 Max, 2021)", "MacBook Pro 16\" (Intel Core i9 / i7, 2019)", "MacBook Pro 14\" (M5 / M5 Pro / M5 Max, 2025/2026)", "MacBook Pro 14\" (M4 / M4 Pro / M4 Max, 2024)", "MacBook Pro 14\" (M3 / M3 Pro / M3 Max, 2023)", "MacBook Pro 14\" (M2 Pro / M2 Max, 2023)", "MacBook Pro 14\" (M1 Pro / M1 Max, 2021)", "MacBook Pro 13\" (M2, 2022)", "MacBook Pro 13\" (M1, 2020)", "MacBook Pro 13\" (Intel 4-Thunderbolt Ports, 2016-2020)", "MacBook Pro 13\" (Intel 2-Thunderbolt Ports, 2016-2020)", "MacBook Pro 13\" (Retina Display, 2012-2015)", "MacBook Pro 13\" (Unibody / CD Drive, 2009-2012)", "MacBook Pro 15\" (Touch Bar, 2016-2019)", "MacBook Pro 15\" (Retina Display, 2012-2015)", "MacBook Pro 15\" (Unibody / CD Drive, 2008-2012)", "MacBook Pro 17\" (Unibody / Legacy, 2006-2011)", "MacBook Air 15\" (M4, 2025)", "MacBook Air 15\" (M3, 2024)", "MacBook Air 15\" (M2, 2023)", "MacBook Air 13\" (M4, 2025)", "MacBook Air 13\" (M3, 2024)", "MacBook Air 13\" (M2, 2022)", "MacBook Air 13\" (M1, 2020)", "MacBook Air 13\" (Retina / Scissor Keyboard, 2020)", "MacBook Air 13\" (Retina / Butterfly Keyboard, 2018-2019)", "MacBook Air 13\" (MQD32 / Broadwell, 2015-2017)", "MacBook Air 13\" (Haswell / Ivy Bridge, 2012-2014)", "MacBook Air 11\" (Intel Core i5, 2010-2015)", "MacBook 12\" (Retina Display, 2015-2017)", "MacBook (White / Black Polycarbonate, 2006-2010)", "Other Apple MacBook"] },
                { id:"dell", label:"Dell", models:["Dell XPS 16 (9640, Core Ultra 9 / 7, 2024-2026)", "Dell XPS 14 (9440, Core Ultra 7, 2024-2026)", "Dell XPS 13 (9350 / 9345 / 9340, Core Ultra Series 2 / Snapdragon X Elite, 2024-2026)", "Dell XPS 13 Plus (9320)", "Dell XPS 15 (9530 / 9520 / 9510 / 9500)", "Dell XPS 17 (9730 / 9720 / 9710 / 9700)", "Dell XPS 13 (9310 / 9305 / 9300 / 9380 / 9370)", "Dell XPS 15 (9570 / 9560 / 9550)", "Dell Latitude 7455 Copilot+ PC (Snapdragon X Elite, 2024-2026)", "Dell Latitude 7450 / 7440 (14\" Core Ultra / 13th Gen)", "Dell Latitude 7430 / 7420 / 7410 / 7400", "Dell Latitude 7490 / 7480 (Core i7 / i5)", "Dell Latitude E7470 / E7450 / E7440", "Dell Latitude 7350 / 7340 / 7330 / 7320 (13.3\")", "Dell Latitude 7390 / 7390 2-in-1", "Dell Latitude 7290 / 7280 / E7270 / E7250 / E7240", "Dell Latitude 5550 / 5540 / 5530 / 5520 (15.6\")", "Dell Latitude 5450 / 5440 / 5430 / 5420 (14\")", "Dell Latitude 5410 / 5400 / 5490 / 5480", "Dell Latitude E5470 / E5450 / E5440 / E5430", "Dell Latitude 5510 / 5500 / 5590 / 5580", "Dell Latitude E5570 / E5550 / E5540", "Dell Latitude E6440 / E6430 / E6420 / E6410", "Dell Latitude E6540 / E6530 / E6520", "Dell Latitude 9450 / 9440 / 9430 / 9420 (2-in-1 Flagship)", "Dell Latitude 3550 / 3540 / 3530 / 3520 / 3510 (15.6\")", "Dell Latitude 3450 / 3440 / 3420 / 3410 / 3400 (14\")", "Dell Latitude 3340 / 3190 / 3189 Education", "Dell Latitude 7330 / 5430 / 7424 Rugged Extreme", "Dell Precision 7780 / 7680 / 7770 / 7670 (16\" / 17\" RTX)", "Dell Precision 5690 / 5680 / 5570 / 5560 / 5550 (OLED Studio)", "Dell Precision 3591 / 3581 / 3571 / 3561 / 3551", "Dell Precision 3490 / 3480 / 3470 (14\" Workstation)", "Dell Precision 7560 / 7550 / 7540 / 7530 / 7520 / 7510", "Dell Precision M4800 / M6800 / M4700 / M6700 Classic", "Dell Inspiron 16 Plus (7630 / 7620, RTX)", "Dell Inspiron 14 Plus (7440 / 7420)", "Dell Inspiron 16 (5630 / 5620 / 5640)", "Dell Inspiron 15 (3535 / 3530 / 3520 / 3511 / 3501)", "Dell Inspiron 15 (5510 / 5502 / 5593 / 5584 / 3593 / 3583)", "Dell Inspiron 15 (3567 / 3542 / 3521 / N5050 / N5110)", "Dell Inspiron 14 (5440 / 5430 / 5420 / 5410 / 3493 / 3480)", "Dell Inspiron 14 / 16 2-in-1 (7430 / 7420 / 7620)", "Dell Vostro 15 (3530 / 3520 / 3510 / 3500 / 3590)", "Dell Vostro 14 (3430 / 3420 / 3400 / 5410)", "Dell G16 Gaming (7630 / 7620, RTX 4070)", "Dell G15 Gaming (5535 / 5530 / 5520 / 5515 / 5511 / 5510)", "Dell G7 / G5 / G3 Gaming (7590 / 5590 / 3590 / 3500)", "Other Dell Laptop"] },
                { id:"hp", label:"HP (Hewlett-Packard)", models:["HP OmniBook Ultra 14 (AMD Ryzen AI 9 HX 375, Copilot+ PC, 2024-2026)", "HP OmniBook X 14 (Snapdragon X Elite, 26hr Battery Copilot+, 2024-2026)", "HP EliteBook X G1a (Next-Gen AI Business Workhorse, 2025/2026)", "HP EliteBook 1040 G12 / G11 (Core Ultra Series 2, 2024-2026)", "HP EliteBook 840 G12 / G11 (Core Ultra Series 2, 2024-2026)", "HP EliteBook 840 G10 (13th Gen, 2023)", "HP EliteBook 840 G9 (12th Gen, 2022)", "HP EliteBook 840 G8 (11th Gen, 2021)", "HP EliteBook 840 G7 (10th Gen, 2020)", "HP EliteBook 840 G6 / G5 (8th Gen, 2018-2019)", "HP EliteBook 840 G4 / G3 (7th & 6th Gen)", "HP EliteBook 840 G2 / G1 (4th & 5th Gen)", "HP EliteBook 1040 G11 / G10 / G9 / G8 (x360 Ultra)", "HP EliteBook 860 G11 / G10 / G9 (16\" Business)", "HP EliteBook 850 G8 / G7 / G6 / G5 / G4 / G3 (15.6\")", "HP EliteBook 830 G11 / G10 / G9 / G8 / G7 / G6 (13.3\")", "HP Elite Dragonfly G4 / G3 / G2 / Dragonfly Pro", "HP EliteBook x360 1030 G8 / G7 / G4 / G3 / G2", "HP EliteBook Folio 9480m / 9470m / 1040 G3 / G2 / G1", "HP EliteBook 8470p / 8460p / 2570p / 2560p Classic", "HP ProBook 450 G10 / G9 / G8 (15.6\" Core i7 / i5)", "HP ProBook 450 G7 / G6 / G5 / G4 / G3 / G2 / G1", "HP ProBook 440 G10 / G9 / G8 (14\" Core i7 / i5)", "HP ProBook 440 G7 / G6 / G5 / G4 / G3 / G2 / G1", "HP ProBook 455 / 445 / 435 G10 / G9 / G8 (AMD Ryzen)", "HP ProBook 430 G8 / G7 / G6 / G5 / G4 / G3 / G2 / G1", "HP ProBook 650 / 640 G8 / G5 / G4 / G3 / G2 / G1", "HP ZBook Fury 16 G11 / G10 / G9 / G8 (RTX 4080 / 5000)", "HP ZBook Studio 16 G10 / G9 / G8 (OLED DreamColor)", "HP ZBook Power 16 / 15 G11 / G10 / G9 / G8 / G7", "HP ZBook Firefly 16 / 14 G11 / G10 / G9 / G8 / G7", "HP ZBook 15 / 17 G6 / G5 / G4 / G3 / G2 / G1 Classic", "HP Spectre x360 14 (Core Ultra, 2024 OLED)", "HP Spectre x360 16 (2024 / 2023 4K OLED)", "HP Spectre x360 13.5 / 13 (Gem Cut / OLED)", "HP Envy x360 16 / 14 (2024 Core Ultra / Ryzen 7)", "HP Envy 17 / 16 (2023 / 2022 Creator)", "HP Envy x360 15 / 13 (2020-2023)", "HP Pavilion Plus 16 / 14 (OLED / 120Hz)", "HP Pavilion Aero 13 (Ultralight Magnesium)", "HP Pavilion x360 15 / 14 (Touchscreen 2-in-1)", "HP Pavilion 15 (eg / eh / cs / cc series)", "HP Laptop 15 (15-dy, 15-dw, 15-da, 15-fd, 15s-fq, 15-ef)", "HP Laptop 14 (14-dq, 14-df, 14-dk, 14-ep, 14-cf)", "HP Laptop 17 (17-cn, 17-cp, 17-by, 17-ca)", "HP 250 / 255 / 240 / 245 (G10 / G9 / G8 / G7 / G6 / G5)", "HP Stream 14 / 11 (Budget / Cloud)", "HP OMEN Transcend 16 / 14 (OLED, RTX 4070)", "HP OMEN 17 / 16 / 15 (Gaming Flagship)", "HP Victus 16 / 15 (Core i7 / i5 / Ryzen 7, RTX 4060/3050)", "Other HP Laptop"] },
                { id:"lenovo", label:"Lenovo & ThinkPad", models:["ThinkPad X1 Carbon Gen 13 Aura Edition (Core Ultra Series 2 Lunar Lake, 2025/2026)", "ThinkPad X1 Carbon Gen 12 (Core Ultra, 2024)", "ThinkPad X1 Carbon Gen 11 / Gen 10 (13th/12th Gen)", "ThinkPad X1 Carbon Gen 9 / Gen 8 / Gen 7 (10th-11th Gen)", "ThinkPad X1 Carbon Gen 6 / Gen 5 / Gen 4 / Gen 3", "ThinkPad X1 Yoga / 2-in-1 (Gen 9 / Gen 8 / Gen 7 / Gen 6)", "ThinkPad X1 Nano Gen 3 / Gen 2 / Gen 1 (<1kg Flagship)", "ThinkPad X1 Extreme Gen 5 / Gen 4 / Gen 3 (16\" RTX)", "ThinkPad X1 Fold (16.3\" / 13.3\" Folding OLED)", "ThinkPad X13 / X13 Yoga Gen 5 / Gen 4 / Gen 3 / Gen 2 / Gen 1", "ThinkPad X390 / X280 / X270 / X260 / X250 / X240 / X230", "ThinkPad T14s Gen 6 (Snapdragon X Elite / AMD Ryzen AI, 2024-2026)", "ThinkPad T14 Gen 5 / Gen 4 / Gen 3 (Core Ultra / Ryzen 7)", "ThinkPad T14 Gen 2 / Gen 1 (Intel & AMD)", "ThinkPad T14s Gen 5 / Gen 4 / Gen 3 / Gen 2 / Gen 1 (Slim)", "ThinkPad T16 Gen 3 / Gen 2 / Gen 1 (16\" Business)", "ThinkPad T490 / T490s / T495 / T480 / T480s (Dual Battery)", "ThinkPad T470 / T470s / T460 / T460s / T450 / T440", "ThinkPad T430 / T420 / T410 / T400 Classic", "ThinkPad T590 / T580 / T570 / T560 / T540p (15.6\")", "ThinkPad P16 / P16s / P16v Gen 2 / Gen 1 (RTX 4000/5000 Ada)", "ThinkPad P1 Gen 7 / Gen 6 / Gen 5 / Gen 4 (Slim Studio)", "ThinkPad P14s Gen 5 / Gen 4 / Gen 3 / Gen 2 (14\" Workstation)", "ThinkPad P15 / P17 Gen 2 / Gen 1, P53 / P52 / P51 / P50", "ThinkPad E14 / E16 Gen 6 / Gen 5 / Gen 4 / Gen 3 / Gen 2 / Gen 1", "ThinkPad E15 / E490 / E480 / E590 / E580", "ThinkPad L14 / L15 / L13 Gen 5 / Gen 4 / Gen 3 / Gen 2 / Gen 1", "ThinkPad Z16 / Z13 Gen 2 / Gen 1 (OLED, Ryzen Pro)", "Lenovo ThinkBook 16 / 16p / 16+ Gen 7 / Gen 6 / Gen 4", "Lenovo ThinkBook 14 / 14s Yoga / 14 Gen 7 / Gen 6 / Gen 4", "Lenovo ThinkBook 15 / 13s / 13x / Plus Twist (e-Ink)", "Lenovo Yoga Slim 7i Aura Edition (Gen 9 Core Ultra Series 2, 2024-2026)", "Lenovo Yoga Slim 7x (Snapdragon X Elite, Copilot+ OLED, 2024-2026)", "Lenovo Yoga Book 9i (Dual 13.3\" 2.8K OLED)", "Lenovo Yoga 9i / Pro 9i (Gen 9 / 8 / 7 4K OLED)", "Lenovo Yoga 7i / Yoga 7 (14\" & 16\" 2-in-1)", "Lenovo Yoga 6 / C940 / C930 / C740 / 920", "Lenovo IdeaPad Pro 5 / 5i (16\" & 14\" 120Hz/OLED)", "Lenovo IdeaPad Slim 5 / 5i (Gen 9 / Gen 8 16\" & 14\")", "Lenovo IdeaPad Slim 3 / 3i (Gen 9 / Gen 8 / Gen 7)", "Lenovo IdeaPad 5 / 3 / 1 (15\", 14\", 17\" - IAU7, ITL05, ADA05)", "Lenovo IdeaPad Flex 5 / 5i / Flex 3 (Touch 2-in-1)", "Lenovo IdeaPad 330 / 320 / 310 / 130 / 110 Classic", "Lenovo Legion 9i (Gen 9 / 8, Liquid Cooled RTX 4090)", "Lenovo Legion Pro 7i / 7 (Gen 9 / 8, RTX 4080 / 4090)", "Lenovo Legion Pro 5i / 5 (Gen 9 / 8, RTX 4070 / 4060)", "Lenovo Legion Slim 7i / 7 / 5i / 5 (Slim Gaming)", "Lenovo Legion Y740 / Y540 / Y530 / Y520 / Y7000", "Lenovo LOQ 15 / 16 (Core i7 / i5 / Ryzen 7, RTX 4060/3050)", "Other Lenovo Laptop"] },
                { id:"asus", label:"ASUS (ZenBook / ROG / TUF / VivoBook)", models:["ASUS Zenbook S 14 (UX5406, Core Ultra Series 2 Lunar Lake OLED, 2024-2026)", "ASUS Zenbook S 16 (UM5606, AMD Ryzen AI 9 HX 370 Ceraluminum, 2024-2026)", "ASUS Zenbook Duo (2024, Dual 14\" 3K OLED 120Hz)", "ASUS Zenbook Pro 16X OLED / Pro 14 OLED", "ASUS Zenbook 14 OLED (UX3405 / UM3406 / UX3402)", "ASUS Zenbook S 13 OLED (UX5304, 1cm Ultra-Thin)", "ASUS Zenbook Flip 13 / 14 / 15 (OLED 2-in-1)", "ASUS Zenbook 15 / 14 / 13 (UX325 / UX425 / UX430 / UX305)", "ASUS ROG Zephyrus G16 (2024 OLED, RTX 4090/4080)", "ASUS ROG Zephyrus G14 (2024 OLED, RTX 4070/4060)", "ASUS ROG Zephyrus M16 / Duo 16 (Dual Screen Gaming)", "ASUS ROG Strix SCAR 18 / 17 / 16 (Core i9, RTX 4090)", "ASUS ROG Strix G18 / G17 / G16 / G15 (Esports Gaming)", "ASUS ROG Flow X16 / Flow X13 (Convertible Gaming)", "ASUS ROG Flow Z13 (Gaming Tablet / Laptop Hybrid)", "ASUS TUF Gaming A15 (FA507, Ryzen 7/9, RTX 4070/4060/4050)", "ASUS TUF Gaming F15 (FX507, Core i7/i5, RTX 4060/4050/3050)", "ASUS TUF Gaming A16 / F16 Advantage Edition", "ASUS TUF Gaming A17 / F17 (17.3\" 144Hz)", "ASUS TUF Dash F15 (FX516 / FX517 Ultra-Slim Gaming)", "ASUS Vivobook S 15 (Snapdragon X Elite, Copilot+ OLED)", "ASUS Vivobook S 16 / S 14 OLED (Core Ultra / Ryzen 8000)", "ASUS Vivobook Pro 16X / 15X OLED (DialPad Creator)", "ASUS Vivobook 16 (X1605 / M1605 16:10 FHD+)", "ASUS Vivobook 15 (X1504 / X1502 / X515 / X512 / X509)", "ASUS Vivobook 14 (X1404 / X1402 / X415 / E410)", "ASUS Vivobook Go 15 / 14 (OLED, Lightweight)", "ASUS Vivobook Flip 14 / 15 (Touchscreen 2-in-1)", "ASUS ProArt Studiobook 16 OLED (H7604 / H5600)", "ASUS ExpertBook B9 / B7 / B5 / B3 / B1 (Enterprise)", "Other ASUS Laptop"] },
                { id:"acer", label:"Acer", models:["Acer Predator Helios 18 / 16 (2024/2023, RTX 4090/4080)", "Acer Predator Helios Neo 18 / 16 (Core i9/i7, RTX 4070)", "Acer Predator Triton 17 X / 16 / 14 (Slim Aluminum)", "Acer Predator Helios 300 / 500 / 700 Classic", "Acer Nitro V 16 / Nitro V 15 (2024/2023, RTX 4060/4050/3050)", "Acer Nitro 16 / Nitro 17 (AMD Ryzen 7 / Intel Core i7)", "Acer Nitro 5 (AN515-58 / AN515-57 / AN515-55 / AN515-54)", "Acer Nitro 5 (AN515-45 / AN515-44 AMD Edition)", "Acer Swift 14 AI (Snapdragon X Elite, Copilot+)", "Acer Swift Go 16 / Go 14 (OLED 3.2K 120Hz)", "Acer Swift Edge 16 (Ultralight 4K OLED)", "Acer Swift X 14 / 16 (Creator RTX 4050)", "Acer Swift 5 / Swift 3 / Swift 1", "Acer Spin 5 / Spin 3 / Spin 1 (Touchscreen 360)", "Acer Aspire 7 Gaming (A715-76 / A715-43, GTX/RTX)", "Acer Aspire 5 (A515-58 / A515-57 / A515-56 / A515-55)", "Acer Aspire 3 (A315-59 / A315-58 / A315-56 / A314-22)", "Acer Aspire Vero (Eco-Friendly PCR Plastic)", "Acer Aspire 1 / Aspire E15 (E5-575 / E5-573 / E5-571)", "Acer Aspire 5733 / 5742 / 5750 / 5738 Classic", "Acer TravelMate P6 / P4 / P2 / Spin (Commercial)", "Acer Chromebook Plus 515 / 514 / Spin 714", "Other Acer Laptop"] },
                { id:"msi", label:"MSI (Micro-Star International)", models:["MSI Titan 18 HX / GT77 HX (4K Mini-LED, RTX 4090)", "MSI Raider GE78 HX / GE68 HX (RGB Matrix, RTX 4090/4080)", "MSI Raider GE77 HX / GE67 HX / GE76 / GE66", "MSI Stealth 18 / 16 / 14 AI Studio (Thin Magnesium)", "MSI Stealth GS77 / GS66 / GS65 Stealth Thin", "MSI Vector 17 HX / 16 HX / GP78 / GP77 / GP68", "MSI Katana 17 / 15 (B13V / B12V, RTX 4070/4060/4050)", "MSI Katana GF76 / GF66 (11th/12th Gen, RTX 3060/3050)", "MSI Pulse 17 / 16 / 15 (AI / GL76 / GL66)", "MSI Sword 17 / 16 / 15 (White & Blue Chassis)", "MSI Cyborg 15 / 14 (Cyberpunk Translucent, RTX 4060/4050)", "MSI Thin 15 / Thin GF63 / GF65 Thin (Budget Gaming)", "MSI Bravo 15 / 17, Alpha 17 / 15 (AMD Advantage)", "MSI Prestige 16 AI Studio / Evo (16\" OLED)", "MSI Prestige 14 AI / 13 AI Evo (<1kg Magnesium)", "MSI Modern 15 / 14 (H / B13M / B12M / B11M Everyday)", "MSI Summit E16 / E14 / E13 Flip (Touchscreen Business)", "MSI Creator Z17 HX / Z16 HX Studio (QHD+ Pen Touch)", "Other MSI Laptop"] },
                { id:"surface", label:"Microsoft Surface", models:["Surface Laptop 7 (Snapdragon X Elite/Plus, Copilot+, 2024)", "Surface Laptop 6 for Business (Core Ultra, 2024)", "Surface Laptop 5 (13.5\" & 15\" Intel 12th Gen, 2022)", "Surface Laptop 4 (13.5\" & 15\" AMD/Intel, 2021)", "Surface Laptop 3 (13.5\" & 15\", 2019)", "Surface Laptop 2 (2018) / Surface Laptop 1 (2017)", "Surface Laptop Studio 2 (Core i7, RTX 4060, 2023)", "Surface Laptop Studio 1 (RTX 3050 Ti, 2021)", "Surface Laptop Go 3 (12.4\" Touchscreen, 2023)", "Surface Laptop Go 2 (2022) / Laptop Go (2020)", "Surface Book 3 (15\" & 13.5\" Detachable GPU, 2020)", "Surface Book 2 (15\" & 13.5\", 2017) / Surface Book 1 (2015)", "Surface Pro 11 (Copilot+ PC, OLED Snapdragon, 2024)", "Surface Pro 10 / Pro 9 / Pro 8 / Pro 7+ (2-in-1)", "Other Microsoft Surface"] },
                { id:"alienware", label:"Alienware (Dell)", models:["Alienware m18 R2 / m18 R1 (18\" Core i9, RTX 4090)", "Alienware m16 R2 / m16 R1 (16\" 240Hz, RTX 4080)", "Alienware x16 R2 / x16 R1 (Ultra-Slim Luxury Gaming)", "Alienware x14 R2 / x14 R1 (World\\", "Alienware x17 R2 / x17 R1 (17.3\" 360Hz / 4K)", "Alienware x15 R2 / x15 R1 (15.6\" QHD 240Hz)", "Alienware m15 R7 / R6 / R5 (Ryzen Edition) / R4 / R3", "Alienware m17 R5 / R4 / R3 / R2 (AMD Advantage / Intel)", "Alienware 17 (R1-R5) / Alienware 15 (R1-R4) Classic", "Alienware 13 (R1-R3 OLED) / Alienware M11x", "Other Alienware Laptop"] },
                { id:"samsung", label:"Samsung Galaxy Book", models:["Samsung Galaxy Book5 Pro 360 (Intel Core Ultra Series 2 Lunar Lake, 2025/2026)", "Samsung Galaxy Book4 Ultra (Core Ultra 9, RTX 4070)", "Samsung Galaxy Book4 Pro 360 (16\" 3K AMOLED Touch)", "Samsung Galaxy Book4 Pro (16\" & 14\" AMOLED 120Hz)", "Samsung Galaxy Book4 Edge / Edge Pro (Snapdragon X Elite, 2024-2026)", "Samsung Galaxy Book4 360 / Galaxy Book4 Standard", "Samsung Galaxy Book3 Ultra (RTX 4070/4050)", "Samsung Galaxy Book3 Pro 360 / Galaxy Book3 Pro", "Samsung Galaxy Book3 360 / Galaxy Book3", "Samsung Galaxy Book2 Pro 360 / Galaxy Book2 Pro", "Samsung Galaxy Book Pro 360 / Galaxy Book Pro (2021)", "Samsung Galaxy Book Flex / Ion / Book S", "Samsung Notebook 9 Pro / Odyssey Gaming", "Samsung Galaxy Chromebook 2 / Go", "Other Samsung Laptop"] },
                { id:"razer", label:"Razer", models:["Razer Blade 18 (2024 / 2023 4K 200Hz, RTX 4090)", "Razer Blade 16 (2024 Dual-Mode Mini-LED / OLED, RTX 4090)", "Razer Blade 14 (2024 / 2023 / 2022 Ryzen 9, RTX 4070)", "Razer Blade 15 (2023 / 2022 / 2021 Advanced / Base)", "Razer Blade 17 / Pro 17 (2022 / 2021 4K 144Hz)", "Razer Blade Stealth 13 (OLED / GTX 1650 Ti)", "Razer Book 13 (Productivity Ultrabook)", "Other Razer Laptop"] },
                { id:"gigabyte", label:"Gigabyte & AORUS", models:["AORUS 17X / 16X (Core i9-14900HX, RTX 4090/4080)", "AORUS 15X / AORUS 15 (QHD 240Hz, RTX 4070)", "AERO 16 OLED (4K UHD+ OLED Creator, RTX 4070)", "AERO 14 OLED (2.8K 90Hz, RTX 4050)", "Gigabyte G6X / G6 (Core i7, RTX 4060 / 4050)", "Gigabyte G5 (KF / MF / GE / GD - Best Value RTX 4060/3050)", "Gigabyte A7 / A5 (AMD Ryzen Gaming)", "Other Gigabyte Laptop"] },
                { id:"huawei", label:"Huawei MateBook", models:["Huawei MateBook X Pro (2024 Core Ultra 9, OLED, 980g)", "Huawei MateBook X Pro (2023 / 2022 / 2021 3.1K Touch)", "Huawei MateBook 16s (16\" 2.5K Touch, Core i9/i7)", "Huawei MateBook 14s (2.5K 90Hz Touch, Core i7)", "Huawei MateBook 14 (Core i7 / i5 / AMD Ryzen 7)", "Huawei MateBook D 16 (2024 / 2023 Core i9 / i7 / i5)", "Huawei MateBook D 15 (2023 / 2022 / 2021 / 2020)", "Huawei MateBook D 14 (2024 / 2023 / 2022 / 2021)", "Huawei MateBook E (12.6\" OLED 2-in-1 Tablet Laptop)", "Other Huawei Laptop"] },
                { id:"lg", label:"LG Gram", models:["LG Gram Pro 17 / 16 (2024 Core Ultra, RTX 3050)", "LG Gram 17 (2024 / 2023 / 2022 / 2021 WQXGA 1.35kg)", "LG Gram 16 (2024 / 2023 / 2022 / 2021 1.19kg)", "LG Gram 15 / Gram 14 (Under 1kg Ultralight)", "LG Gram SuperSlim (15.6\" OLED 990g, 10.9mm)", "LG Gram Style 16 / 14 (Color-Shifting Glass OLED)", "LG Gram 2-in-1 16 / 14 (Wacom Stylus)", "Other LG Laptop"] },
                { id:"tecno", label:"Tecno Megabook (Ghana / Africa Market Leader)", models:["Tecno Megabook T1 (15.6\" Core i5/i7, 70Wh Battery)", "Tecno Megabook T1 (14\" Intel / AMD Ryzen 5)", "Tecno Megabook T16 Pro (Core Ultra 7 / 5, AI PC)", "Tecno Megabook S1 (15.6\" 3.2K 120Hz Flagship, Core i7)", "Tecno Megabook K16S (16\" AMD Ryzen 5, 1TB SSD)", "Tecno Megabook T14 / T15 Standard", "Other Tecno Laptop"] },
                { id:"infinix", label:"Infinix InBook (Ghana / Africa Market Leader)", models:["Infinix InBook Air Pro+ (14\" 2.8K 120Hz OLED, Core i7/i5, 2024-2026)", "Infinix GT Book (16\" 165Hz, Core i9-13900H, RTX 4060 Gaming, 2024-2026)", "Infinix InBook Y4 Max (16\" FHD, 13th Gen Core i7/i5, 2024-2026)", "Infinix ZERO BOOK Ultra (Core i9-13900H, Overboost)", "Infinix ZERO BOOK 13th Gen (Core i7 / i5)", "Infinix InBook Y3 Max (16\" FHD, Core i7/i5/i3)", "Infinix InBook Y2 Plus (15.6\" Core i5/i3, 50Wh)", "Infinix InBook Y1 Plus (15.6\" 10th Gen Core i5/i3)", "Infinix InBook X3 Slim (14\" Aluminum 1.24kg)", "Infinix InBook X2 (14\" Dual-Star Light Camera)", "Infinix InBook X1 Pro / X1 (14\" Core i7/i5/i3)", "Other Infinix Laptop"] },
                { id:"toshiba", label:"Toshiba & Dynabook", models:["Toshiba Satellite C55 / C50 / C55D (15.6\" Everyday)", "Toshiba Satellite L50 / L55 / L850 / L750 / L650", "Toshiba Satellite P50 / P55 / P750 / P850 (Harman Kardon)", "Toshiba Satellite Pro C40 / C50 (Business)", "Toshiba Tecra A50 / A40 / Z50 / Z40 (Corporate)", "Toshiba Port\u00e9g\u00e9 Z30 / Z20t / R30 (Ultralight Magnesium)", "Toshiba Qosmio X70 / X75 / X870 (Gaming / Red Backlit)", "Dynabook Port\u00e9g\u00e9 X40-K / X30-K / X30W (2-in-1, Core i7)", "Dynabook Tecra A50-K / A40-K (12th/13th Gen)", "Dynabook Satellite Pro C50-J / C40-J", "Other Toshiba / Dynabook Laptop"] },
                { id:"sony", label:"Sony VAIO", models:["VAIO SX14 (Core Ultra / 13th Gen, 4K Carbon Fiber)", "VAIO SX12 (12.5\" Ultra-Compact, 899g)", "VAIO FE15 / FE14 (15.6\" & 14\" Full HD Core i5/i7)", "VAIO F16 / F14 (Everyday Japanese Craftsmanship)", "VAIO Z Flagship (Full Carbon Unibody)", "Sony VAIO Fit 15 / 14 / 15A Multi-Flip Touch", "Sony VAIO Pro 13 / 11 (Carbon Fiber Ultrabook)", "Sony VAIO E-Series (SVE15 / SVE14 / VPCEB / VPCEA)", "Sony VAIO S-Series (SVS15 / SVS13 Magnesium)", "Sony VAIO C-Series (VPCCB / VPCCA Neon Orange/Green)", "Sony VAIO T-Series (SVT13 / SVT14 Touch Ultrabook)", "Other Sony VAIO Laptop"] },
                { id:"panasonic", label:"Panasonic Toughbook", models:["Panasonic Toughbook 55 (Mk3 / Mk2 / Mk1 Modular Semi-Rugged)", "Panasonic Toughbook 40 (Fully Rugged IP66 Mil-Spec)", "Panasonic Toughbook 33 (12\" 3:2 QHD Detachable Rugged)", "Panasonic Toughbook CF-31 (Mk5 / Mk4 / Mk3 / Mk2 / Mk1 Tank)", "Panasonic Toughbook CF-19 (Rotating Convertible Heavy Duty)", "Panasonic Toughbook CF-54 / CF-53 / CF-52 Semi-Rugged", "Panasonic Toughbook G2 / CF-20 Rugged", "Panasonic Let\\", "Other Panasonic Toughbook"] },
                { id:"fujitsu", label:"Fujitsu LIFEBOOK", models:["Fujitsu LIFEBOOK U9313X / U9313 / U9312 (Ultralight <890g)", "Fujitsu LIFEBOOK U7513 / U7413 / U7313 (Enterprise)", "Fujitsu LIFEBOOK E5513 / E5413 / E5512 / E5412 (Workhorse)", "Fujitsu LIFEBOOK A3511 / A3510 / A557 / A555 Classic", "Fujitsu LIFEBOOK T939 / T938 / T937 (Convertible Touch Pen)", "Fujitsu STYLISTIC Q7311 / Q7310 2-in-1 Rugged", "Other Fujitsu Laptop"] },
            { id:"other-brand", label:"Other Brand", models:["Other Model"] },
        ]},
    ]},
    "vehicles": { subcategories: [
        { id:"cars", label:"Cars", brands:[
            { id:"toyota", label:"Toyota", models:["Corolla", "Corolla Altis", "Corolla Cross", "Camry", "Avalon", "Yaris", "Yaris Sedan", "Prius", "Prius Prime", "Aqua", "Belta", "Vios", "Crown", "Crown Athlete", "Crown Majesta", "Crown Signia", "Mirai", "Etios", "Starlet", "Matrix", "Auris", "Blade", "bZ3", "bZ4X", "C-HR", "RAV4", "Harrier", "Venza", "Highlander", "Kluger", "Land Cruiser", "Land Cruiser Prado", "Fortuner", "Sequoia", "4Runner", "FJ Cruiser", "Rush", "Raize", "Urban Cruiser", "Hilux", "Tacoma", "Tundra", "Dyna", "Hiace", "Proace", "Sienna", "Alphard", "Vellfire", "Noah", "Voxy", "Esquire", "Avanza", "Innova", "Innova Crysta", "Rumion", "Roomy", "LiteAce", "Coaster", "Supra", "GR86", "86", "Celica", "MR2", "Paseo", "Soarer", "Ipsum", "Picnic", "Premio", "Allion", "Mark X", "Platz", "Wish", "Verso"] },
            { id:"honda", label:"Honda", models:["Civic", "Civic Type R", "Accord", "City", "Fit", "Jazz", "Insight", "Amaze", "Brio", "Ballade", "Greiz", "Crider", "Legend", "Inspire", "Avancier", "Prelude", "CR-Z", "e:NP1", "e:NS1", "Honda e", "HR-V", "WR-V", "BR-V", "CR-V", "ZR-V", "Pilot", "Passport", "Element", "Crosstour", "Vezel", "Odyssey", "Freed", "Stepwgn", "Mobilio", "Stream", "Shuttle", "Elysion", "Jade", "Ridgeline", "Acty", "Beat", "S2000", "NSX", "Integra", "Domani", "Partner", "Airwave", "Spirior"] },
            { id:"nissan", label:"Nissan", models:["Altima", "Sentra", "Sunny", "Versa", "Tiida", "Almera", "Sylphy", "Teana", "Maxima", "Bluebird", "Primera", "Latio", "Cefiro", "Laurel", "Gloria", "Fuga", "Skyline", "GT-R", "370Z", "350Z", "Z", "Leaf", "Ariya", "Sakura", "Note", "Note e-Power", "Micra", "March", "Pulsar", "Juke", "Kicks", "Qashqai", "Rogue", "X-Trail", "Murano", "Pathfinder", "Patrol", "Armada", "Terrano", "Magnite", "Navara", "Frontier", "Titan", "NP300", "Caravan", "Urvan", "NV200", "NV350", "Elgrand", "Serena", "Quest", "Cube", "AD Van", "Wingroad", "Livina", "Dayz"] },
            { id:"hyundai", label:"Hyundai", models:["Elantra", "Avante", "Sonata", "Accent", "Verna", "i10", "Grand i10", "i20", "i30", "i40", "Xcent", "Aura", "Azera", "Grandeur", "Excel", "Venue", "Kona", "Kona Electric", "Creta", "ix25", "Tucson", "Santa Fe", "Palisade", "Terracan", "ix35", "Bayon", "Casper", "Nexo", "Ioniq", "Ioniq 5", "Ioniq 6", "Ioniq 9", "Tucson Hybrid", "Santa Fe Hybrid", "Staria", "H1", "H100", "Starex", "Porter", "Mighty", "Santa Cruz", "Veloster", "Coupe", "Tiburon", "Genesis Coupe", "Matrix", "Lavita", "Trajet"] },
            { id:"kia", label:"Kia", models:["Picanto", "Morning", "Rio", "Rio5", "Cerato", "Forte", "K3", "K4", "K5", "Optima", "K7", "Cadenza", "K8", "K9", "Quoris", "Pride", "Sephia", "Shuma", "Soul", "Niro", "Niro EV", "Seltos", "Sonet", "Sportage", "Sorento", "Telluride", "Stonic", "XCeed", "Ceed", "ProCeed", "Carens", "Rondo", "Carnival", "Sedona", "Ray", "EV3", "EV5", "EV6", "EV9", "Bongo", "Mohave", "Borrego", "Pregio", "Joice", "Opirus", "Amanti", "Stinger"] },
            { id:"mazda", label:"Mazda", models:["Mazda2", "Mazda3", "Mazda6", "Mazda323", "Mazda626", "Mazda929", "Atenza", "Axela", "Demio", "Familia", "Protege", "MX-30", "CX-3", "CX-30", "CX-4", "CX-5", "CX-50", "CX-60", "CX-70", "CX-80", "CX-90", "Tribute", "Navajo", "BT-50", "B-Series", "MPV", "Premacy", "5", "Biante", "Verisa", "RX-7", "RX-8", "MX-5 Miata", "Cosmo", "Roadster", "Carol", "Scrum", "Flair", "Laputa"] },
            { id:"volkswagen", label:"Volkswagen", models:["Polo", "Polo Sedan", "Golf", "Golf GTI", "Golf R", "Jetta", "Passat", "Arteon", "Virtus", "Vento", "Ameo", "Bora", "Sagitar", "Lavida", "Lamando", "Santana", "CC", "Phaeton", "Touareg", "Tiguan", "Tiguan Allspace", "T-Cross", "Taos", "T-Roc", "Teramont", "Atlas", "ID.3", "ID.4", "ID.5", "ID.6", "ID.7", "e-Golf", "Amarok", "Saveiro", "Caddy", "Touran", "Sharan", "Caravelle", "Multivan", "Transporter", "Kombi", "Crafter", "Beetle", "New Beetle", "Scirocco", "Eos", "Up!", "Fox", "Lupo"] },
            { id:"peugeot", label:"Peugeot", models:["107", "108", "206", "206+", "207", "208", "301", "306", "307", "308", "406", "407", "408", "508", "605", "607", "2008", "3008", "4007", "4008", "5008", "504", "505", "508 SW", "Partner", "Rifter", "Traveller", "Expert", "Boxer", "Landtrek", "RCZ", "e-208", "e-2008", "e-308", "e-Partner", "e-Expert", "e-Traveller"] },
            { id:"renault", label:"Renault", models:["Clio", "Megane", "Megane RS", "Taliant", "Logan", "Symbol", "Fluence", "Talisman", "Laguna", "Safrane", "Latitude", "Kwid", "Sandero", "Zoe", "Twizy", "Megane E-Tech", "Scenic E-Tech", "Arkana", "Captur", "Kadjar", "Koleos", "Austral", "Espace", "Duster", "Kiger", "Triber", "Kangoo", "Dokker", "Express", "Trafic", "Master", "Alaskan", "Oroch", "Modus", "Vel Satis", "4", "5", "12", "18", "21", "Avantime"] },
            { id:"ford", label:"Ford", models:["Fiesta", "Focus", "Fusion", "Taurus", "Mondeo", "Escort", "Aspire", "Ka", "Figo", "Ikon", "Falcon", "Crown Victoria", "Five Hundred", "Freestyle", "Mustang", "Mustang Mach-E", "GT", "Probe", "Thunderbird", "EcoSport", "Escape", "Kuga", "Edge", "Everest", "Explorer", "Expedition", "Bronco", "Bronco Sport", "Puma", "Territory", "Flex", "F-150", "F-250", "F-350", "Ranger", "Maverick", "Courier", "Super Duty", "Transit", "Transit Connect", "Tourneo", "E-Series", "Windstar", "Galaxy", "S-Max", "C-Max"] },
            { id:"chevrolet", label:"Chevrolet", models:["Spark", "Beat", "Aveo", "Sail", "Sonic", "Cruze", "Malibu", "Impala", "Prisma", "Cobalt", "Optra", "Epica", "Caprice", "Cavalier", "Lumina", "Onix", "Monza", "Groove", "Tracker", "Trax", "Equinox", "Blazer", "Trailblazer", "Traverse", "Tahoe", "Suburban", "Captiva", "Niva", "Orlando", "Spin", "Montana", "Colorado", "Silverado", "S-10", "D-Max", "Express", "Astro", "Camaro", "Corvette", "SSR", "Bolt EV", "Bolt EUV", "Menlo"] },
            { id:"mercedes-benz", label:"Mercedes-Benz", models:["A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "S-Class", "Maybach S-Class", "EQA", "EQB", "EQC", "EQE", "EQS", "EQA Sedan", "CLC", "CLK", "SLK", "SLC", "AMG GT", "SL", "SLR McLaren", "CLE", "GLA", "GLB", "GLC", "GLC Coupe", "GLE", "GLE Coupe", "GLS", "G-Class", "EQG", "ML-Class", "GLK", "M-Class", "R-Class", "V-Class", "Vito", "Citan", "Sprinter", "X-Class", "190", "220", "230", "240", "260", "280", "300", "400", "500", "560", "EQV"] },
            { id:"bmw", label:"BMW", models:["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX2", "iX3", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z3", "Z4", "M2", "M3", "M4", "M5", "M8", "X3 M", "X4 M", "X5 M", "X6 M", "2002", "E30", "318i", "320i", "325i", "328i", "330i", "335i", "520i", "523i", "525i", "528i", "530i", "535i", "540i", "728i", "730i", "735i", "740i", "745i", "750i"] },
            { id:"audi", label:"Audi", models:["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "e-tron GT", "Q2 e-tron", "Q4 e-tron", "Q6 e-tron", "Q8 e-tron", "TT", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "S3", "S4", "S5", "S6", "S7", "S8", "Q2", "Q3", "Q5", "Q7", "Q8", "SQ5", "SQ7", "SQ8", "Allroad", "A4 Allroad", "A6 Allroad", "80", "90", "100", "200", "Coupe", "Cabriolet"] },
            { id:"lexus", label:"Lexus", models:["IS", "ES", "GS", "LS", "HS", "CT", "UX", "NX", "RX", "RZ", "GX", "LX", "LBX", "LM", "RC", "LC", "LFA", "TX", "SC", "SC430", "RX Hybrid", "NX Hybrid", "UX Hybrid", "ES Hybrid", "LS Hybrid", "LX 570", "GX 460", "RX 350", "RX 450h", "IS 250", "IS 350", "ES 350"] },
            { id:"volvo", label:"Volvo", models:["S40", "S60", "S80", "S90", "V40", "V50", "V60", "V70", "V90", "XC40", "XC60", "XC70", "XC90", "EX30", "EX40", "EC40", "EX90", "C30", "C40", "C70", "240", "740", "850", "940", "960", "P1800", "Amazon", "V60 Cross Country", "V90 Cross Country"] },
            { id:"jaguar", label:"Jaguar", models:["XE", "XF", "XJ", "S-Type", "X-Type", "F-Type", "XK", "XKR", "I-PACE", "E-PACE", "F-PACE", "C-X17", "Mark 2", "XJS", "Sovereign"] },
            { id:"genesis", label:"Genesis", models:["G70", "G80", "G90", "GV60", "GV70", "GV80", "Electrified G80", "Electrified GV70", "Genesis Coupe", "BH", "DH"] },
            { id:"tesla", label:"Tesla", models:["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster", "Semi"] },
            { id:"porsche", label:"Porsche", models:["Cayenne", "Macan", "Macan Electric", "911", "Taycan", "Panamera"] },
            { id:"other-brand", label:"Other Brand", models:["Other Model"] },
        ]},
        { id:"motorcycles", label:"Motorcycles & Scooters", brands:[
            { id:"bajaj",     label:"Bajaj",     models:["Boxer 100","Discover 100","Discover 125","Pulsar 150","Pulsar 220","Other Bajaj"] },
            { id:"yamaha-mc", label:"Yamaha",    models:["Saluto 125","FZ-S","R15","MT-15","NMAX","Other Yamaha"] },
            { id:"honda-mc",  label:"Honda",     models:["CB125F","CB300R","CB500F","CBR300R","Other Honda"] },
            { id:"suzuki-mc", label:"Suzuki",    models:["GSX-R150","Raider R150","Gixxer 150","Other Suzuki"] },
            { id:"kawasaki",  label:"Kawasaki",  models:["Ninja 300","Ninja 400","Z400","Versys 650","Other Kawasaki"] },
        ]},
        { id:"trucks",        label:"Trucks & Vans",             brands:[
            { id:"mercedes-t",label:"Mercedes-Benz", models:["Actros","Axor","Atego","Sprinter","Other"] },
            { id:"man-t",     label:"MAN",            models:["TGS","TGA","TGX","TGL","Other"] },
            { id:"volvo-t",   label:"Volvo",          models:["FH","FM","FMX","FL","Other"] },
            { id:"isuzu-t",   label:"Isuzu",          models:["NPR","NQR","FVZ","ELF","Other"] },
        ]},
        { id:"auto-parts",    label:"Auto Parts & Accessories",  brands:[] },
        { id:"bicycles",      label:"Bicycles",                  brands:[] },
    ]},
    "electronics": { subcategories: [
        { id:"tablets",           label:"Tablets",             brands:[
            { id:"apple-tab",    label:"Apple iPad",        models:["iPad Pro 13\" (M4)","iPad Pro 11\" (M4)","iPad Air 13\" (M2)","iPad Air 11\" (M2)","iPad mini 7","iPad (10th Gen)","iPad (9th Gen)","Other iPad"] },
            { id:"samsung-tab",  label:"Samsung",           models:["Galaxy Tab S9 Ultra","Galaxy Tab S9+","Galaxy Tab S9","Galaxy Tab S8","Galaxy Tab A9+","Other Samsung"] },
            { id:"lenovo-tab",   label:"Lenovo",            models:["Lenovo Tab P12","Tab P11 Pro","Tab M10 Plus","Other Lenovo"] },
        ]},
        { id:"tv-dvd",            label:"TV & DVD",            brands:[] },
        { id:"audio-music",       label:"Audio & Music",       brands:[] },
        { id:"cameras",           label:"Cameras",             brands:[] },
        { id:"gaming",            label:"Gaming",              brands:[] },
        { id:"other-electronics", label:"Other Electronics",   brands:[] },
    ]},
    "fashion": { subcategories: [
        { id:"womens-clothing",   label:"Women's Clothing",    brands:[] },
        { id:"mens-clothing",     label:"Men's Clothing",      brands:[] },
        { id:"kids-clothing",     label:"Kids & Baby",         brands:[] },
        { id:"shoes-footwear",    label:"Shoes & Footwear",    brands:[] },
        { id:"bags-luggage",      label:"Bags & Luggage",      brands:[] },
        { id:"watches-jewelry",   label:"Watches & Jewelry",   brands:[] },
        { id:"accessories",       label:"Accessories",         brands:[] },
    ]},
    "property": { subcategories: [
        { id:"apartment-rent",    label:"Apartment for Rent",  brands:[] },
        { id:"apartment-sale",    label:"Apartment for Sale",  brands:[] },
        { id:"house-rent",        label:"House for Rent",      brands:[] },
        { id:"house-sale",        label:"House for Sale",      brands:[] },
        { id:"land",              label:"Land",                brands:[] },
        { id:"commercial",        label:"Commercial Property", brands:[] },
        { id:"short-let",         label:"Short Let / Airbnb",  brands:[] },
    ]},
    "jobs": { subcategories: [
        { id:"tech-software",     label:"Tech & Software",     brands:[] },
        { id:"sales-marketing",   label:"Sales & Marketing",   brands:[] },
        { id:"healthcare-jobs",   label:"Healthcare",          brands:[] },
        { id:"education",         label:"Education",           brands:[] },
        { id:"hospitality",       label:"Hospitality",         brands:[] },
        { id:"accounting",        label:"Accounting & Finance",brands:[] },
        { id:"engineering",       label:"Engineering",         brands:[] },
        { id:"other-jobs",        label:"Other Jobs",          brands:[] },
    ]},
    "home-appliances": { subcategories: [
        { id:"refrigerators",     label:"Refrigerators & Freezers", brands:[] },
        { id:"washing-machines",  label:"Washing Machines",    brands:[] },
        { id:"air-conditioners",  label:"Air Conditioners",    brands:[] },
        { id:"cookers",           label:"Cookers & Ovens",     brands:[] },
        { id:"small-appliances",  label:"Small Appliances",    brands:[] },
        { id:"other-appliances",  label:"Other Appliances",    brands:[] },
    ]},
    "services": { subcategories: [
        { id:"cleaning",          label:"Cleaning",            brands:[] },
        { id:"repairs",           label:"Repairs & Maintenance",brands:[] },
        { id:"beauty-services",   label:"Beauty & Wellness",   brands:[] },
        { id:"tutoring",          label:"Tutoring & Education",brands:[] },
        { id:"transport",         label:"Transport & Delivery",brands:[] },
        { id:"other-services",    label:"Other Services",      brands:[] },
    ]},
};

// ─── Category Field Schemas (web-matching) ────────────────────────────────────
const CAT_FIELDS: Record<string,any[]> = {
    "vehicles": [
        { key:"condition",       label:"Condition",         type:"select",      opts:["Brand New","Used in Ghana","Foreign Used"],                                                                                 required:true  },
        { key:"year",            label:"Year",              type:"select",      opts:YEARS,                                                                                                                        required:true  },
        { key:"mileage",         label:"Kilometers",        type:"number",      placeholder:"e.g. 45000",         unit:"km",                                                                                       required:false },
        { key:"bodyType",        label:"Body Type",         type:"select",      opts:["Sedan","SUV","Pickup Truck","Hatchback","Coupe","Convertible","Van","Minivan","Wagon","Crossover","Other"],                 required:false },
        { key:"transmission",    label:"Transmission",      type:"select",      opts:["Automatic","Manual","CVT","Semi-Automatic"],                                                                                required:false },
        { key:"fuelType",        label:"Fuel Type",         type:"select",      opts:["Petrol","Diesel","Electric","Hybrid","Plug-in Hybrid","Natural Gas","Other"],                                               required:false },
        { key:"regionalSpecs",   label:"Regional Specs",    type:"select",      opts:["American Specs","European Specs","Japanese Specs","Korean Specs","Other"],                                                  required:false },
        { key:"sellerType",      label:"Seller Type",       type:"select",      opts:["Owner","Dealer","Company"],                                                                                                 required:false },
        { key:"color",           label:"Exterior Color",    type:"select",      opts:["White","Black","Silver","Grey","Blue","Red","Green","Brown","Beige","Gold","Orange","Yellow","Other"],                       required:false },
        { key:"driveType",       label:"Drive Type",        type:"select",      opts:["Front Wheel Drive","Rear Wheel Drive","4 Wheel Drive","All Wheel Drive"],                                                   required:false },
        { key:"registrationType",label:"Registration Type", type:"select",      opts:["Registered","Not Registered"],                                                                                             required:false },
        { key:"highlights",      label:"Highlights",        type:"multiselect", opts:["First Owner","No Accidents","In Warranty","Full Service History","No Major Repairs","Bank Finance Available","Insurance Included","Recently Serviced","Low Mileage","GCC Specs"] },
        { key:"features",        label:"Features",          type:"multiselect", opts:["Air Conditioning","Dual Zone Climate Control","Tri-Zone Climate Control","Rear A/C Vents","Heated Seats","Cooled / Ventilated Seats","Sunroof","Power Sunroof","Panoramic Sunroof","Keyless Entry","Keyless Go / Push Start","Power Windows","Power Mirrors","Touchscreen Display","Navigation / GPS","Apple CarPlay","Android Auto","Wireless Charging Pad","Bluetooth System","USB Ports","Reverse Camera","360° Surround View Camera","Front Parking Sensor","Rear Parking Sensor","Front Airbags","Side Curtain Airbags","ABS (Anti-lock Brakes)","Electronic Stability Control","Collision Warning / AEB","Lane Departure Warning","Blind Spot Monitor","Adaptive Cruise Control","LED Headlights","Fog Lights","Sport Mode","Paddle Shifters","Premium Alloy Wheels","Leather Seats","Third Row Seating","Anti-Theft Alarm","Tow Bar"] },
    ],
    "mobile-phones": [
        { key:"condition",  label:"Condition",        type:"select",      opts:["Brand New","Used","Foreign Used","Refurbished"],                                         required:true  },
        { key:"storage",    label:"Storage",          type:"select",      opts:["16GB","32GB","64GB","128GB","256GB","512GB","1TB","2TB","Other"],                        required:false },
        { key:"ram",        label:"RAM",              type:"select",      opts:["2GB","4GB","6GB","8GB","12GB","16GB","24GB","32GB","Other"],                             required:false },
        { key:"color",      label:"Color",            type:"select",      opts:["Black","White","Gold","Silver","Blue","Purple","Green","Red","Pink","Yellow","Other"],    required:false },
        { key:"simType",    label:"SIM Type",         type:"select",      opts:["Single SIM","Dual SIM","eSIM","Nano-SIM + eSIM","Dual SIM + eSIM","Other"],             required:false },
        { key:"battery",    label:"Battery",          type:"text",        placeholder:"e.g. 5000 mAh, 100% Health",                                                      required:false },
        { key:"os",         label:"Operating System", type:"select",      opts:["Android","iOS","HarmonyOS","Other"],                                                     required:false },
        { key:"features",   label:"Features",         type:"multiselect", opts:["5G","NFC","Face ID","Fingerprint","Water Resistant (IP68)","Wireless Charging","Fast Charging","Wi-Fi 7","Bluetooth 5.4","eSIM","MagSafe","AI Features"] },
        { key:"accessories",label:"Included Accessories",type:"multiselect",opts:["Original Box","Charger","Case","Screen Protector","Earphones","Manual","All Accessories"] },
    ],
    "laptops": [
        { key:"condition",  label:"Condition",   type:"select", opts:["Brand New","Used","Foreign Used","Refurbished"],                                    required:true  },
        { key:"ram",        label:"RAM",         type:"select", opts:["4GB","8GB","16GB","32GB","64GB","128GB","Other"],                                   required:false },
        { key:"storage",    label:"Storage",     type:"select", opts:["128GB SSD","256GB SSD","512GB SSD","1TB SSD","2TB SSD","256GB HDD","512GB HDD","1TB HDD","2TB HDD","Other"], required:false },
        { key:"processor",  label:"Processor",   type:"text",   placeholder:"e.g. Intel Core i7-12th Gen",                                               required:false },
        { key:"screenSize", label:"Screen Size", type:"text",   placeholder:"e.g. 15.6 inches",                                                           required:false },
        { key:"color",      label:"Color",       type:"select", opts:["Black","Silver","Gold","Grey","White","Blue","Other"],                              required:false },
        { key:"features",   label:"Features",    type:"multiselect", opts:["Backlit Keyboard","Touchscreen","Fingerprint Reader","Face ID","USB-C / Thunderbolt","Wi-Fi 6E","Bluetooth 5","Original Charger Included","Original Box"] },
    ],
    "electronics": [
        { key:"condition",  label:"Condition",   type:"select", opts:["Brand New","Used","Foreign Used","Refurbished"],                                    required:true  },
        { key:"color",      label:"Color",       type:"select", opts:["Black","White","Silver","Grey","Blue","Red","Other"],                              required:false },
        { key:"features",   label:"Features",    type:"multiselect", opts:["Original Box","Warranty","Remote Control Included","Delivery Available","Self-Collect"] },
    ],
    "property": [
        { key:"propertyType",label:"Property Type",   type:"select", opts:["Apartment","House","Villa","Studio","Room","Townhouse","Land","Office","Shop","Other"], required:true  },
        { key:"bedrooms",    label:"Bedrooms",         type:"select", opts:["Studio","1","2","3","4","5","6+"],                                                    required:false },
        { key:"bathrooms",   label:"Bathrooms",        type:"select", opts:["1","2","3","4","5+"],                                                                 required:false },
        { key:"furnishing",  label:"Furnishing",       type:"select", opts:["Furnished","Semi-Furnished","Unfurnished"],                                          required:false },
        { key:"features",    label:"Amenities",        type:"multiselect", opts:["Swimming Pool","Gym","Security / Guard","CCTV","Generator","Water Included","Parking","Garden / Compound","Balcony","Air Conditioning","Inverter","Solar Power","Water Heater"] },
    ],
    "jobs": [
        { key:"jobType",    label:"Job Type",          type:"select", opts:["Full-Time","Part-Time","Contract","Remote","Internship","Freelance"],                 required:true  },
        { key:"salaryType", label:"Salary Type",       type:"select", opts:["Monthly","Weekly","Daily","Hourly","Commission","Negotiable"],                       required:false },
        { key:"experience", label:"Experience Level",  type:"select", opts:["No Experience","Entry Level","1-2 Years","3-5 Years","5+ Years","Senior / Manager"], required:false },
        { key:"education",  label:"Education",         type:"select", opts:["No Requirement","WASSCE / O-Levels","HND / Diploma","Bachelor's Degree","Master's Degree","PhD"], required:false },
    ],
    "services": [
        { key:"serviceType",label:"Service Type",      type:"select", opts:["One-Time","Recurring","On-Demand","Subscription"],                                   required:false },
        { key:"features",   label:"Highlights",        type:"multiselect", opts:["Free Consultation","Same Day Service","24/7 Available","Certified Professional","Insured","Home Service","Online / Remote"] },
    ],
    "fashion": [
        { key:"condition",  label:"Condition",         type:"select", opts:["Brand New","Used - Like New","Used - Good","Used - Fair"],                            required:true  },
        { key:"color",      label:"Color",             type:"select", opts:["Black","White","Red","Blue","Green","Yellow","Pink","Brown","Grey","Beige","Gold","Silver","Multi","Other"], required:false },
        { key:"size",       label:"Size",              type:"text",   placeholder:"e.g. M, L, XL, US 10, UK 8",                                                  required:false },
        { key:"material",   label:"Material",          type:"text",   placeholder:"e.g. Cotton, Leather, Polyester",                                             required:false },
        { key:"features",   label:"Features",          type:"multiselect", opts:["Original / Authentic","Designer Brand","Limited Edition","Vintage","Never Worn","With Tags","With Original Box"] },
    ],
    "home-appliances": [
        { key:"condition",  label:"Condition",         type:"select", opts:["Brand New","Used - Like New","Used - Good","Used - Fair"],                            required:true  },
        { key:"features",   label:"Highlights",        type:"multiselect", opts:["Original Box","Warranty","Delivery Available","Self-Collect","Comes with Remote"] },
    ],
};

// ─── API helper ───────────────────────────────────────────────────────────────
function getSubcats(slug: string, apiCats: any[]): any[] {
    if (apiCats.length > 0) {
        const ac = apiCats.find((c:any)=>(c.slug||c.id||"")===slug);
        if (ac && (ac.subcategories||[]).length > 0) return ac.subcategories;
    }
    return DD[slug]?.subcategories || [];
}

const DRAFT_KEY = "RYTOK_DRAFT_V3";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SellScreen() {
    // ── Form state ────────────────────────────────────────────────────────────
    const [step, setStep]     = useState(0);
    const [form, setFormRaw]  = useState({
        title:"", description:"", category:"", subcategory:"",
        condition:"", price:"", is_negotiable:false,
        locationRegion:"", locationCity:"", location:"", phone:"",
    });
    const [dynVals, setDynVals]       = useState<Record<string,any>>({}); // extra cat fields
    const [images, setImages]         = useState<{id:string;uri:string}[]>([]);
    const [error, setError]           = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [apiCats, setApiCats]           = useState<any[]>([]);
    const [drillPath, setDrillPath]       = useState<string[]>([]);
    const [drillSel, setDrillSel]         = useState({ brand:false, model:false });
    const [activeSelect, setActiveSelect] = useState<{key:string;label:string;opts:string[]}|null>(null);
    const [regionPickerOpen, setRegionPickerOpen] = useState(false);
    const [cityPickerOpen, setCityPickerOpen]       = useState(false);
    const [showDraftModal, setShowDraftModal]     = useState(false);
    const [showPhotoModal, setShowPhotoModal]     = useState(false);
    const [openToTrade, setOpenToTrade]           = useState(false);
    const [scheduleEnabled, setScheduleEnabled]   = useState(false);
    const [draftSaved, setDraftSaved]             = useState(false);

    // ── Mode: 'select' | 'manual' | 'ai' ─────────────────────────────────────
    const [mode, setMode]                 = useState<'select'|'manual'|'ai'>('select');

    // ── AI flow state ──────────────────────────────────────────────────────────
    const [aiStep, setAiStep]             = useState<'upload'|'scanning'|'review'|'done'>('upload');
    const [aiImage, setAiImage]           = useState<{id:string;uri:string}|null>(null);
    const [aiExtraImages, setAiExtraImages] = useState<{id:string;uri:string}[]>([]);
    const [aiAnalysis, setAiAnalysis]     = useState<any>(null);
    const [aiError, setAiError]           = useState('');
    const [aiSubmitting, setAiSubmitting] = useState(false);
    const [aiForm, setAiFormRaw]          = useState({
        title:'', description:'', category:'', subcategory:'',
        brand:'', model:'', condition:'', price:'',
        locationRegion:'', locationCity:'', location:'',
        is_negotiable:true,
    });
    const [aiSpecs, setAiSpecs]           = useState<Record<string,string>>({});

    const setAiField = (k: string, v: any) => setAiFormRaw(p => ({ ...p, [k]: v }));

    const setField = (k: string, v: any) => setFormRaw(p => ({ ...p, [k]: v }));

    // ── Draft auto-save ───────────────────────────────────────────────────────
    useEffect(() => {
        AsyncStorage.getItem(DRAFT_KEY).then(raw => {
            if (!raw) return;
            try {
                const d = JSON.parse(raw);
                if (d?.form?.title || d?.form?.category) setShowDraftModal(true);
            } catch(_) {}
        });
    }, []);

    useEffect(() => {
        if (!form.title && !form.category) return;
        const payload = { form, dynVals, step, images: images.map(i=>i.uri) };
        AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
            .then(() => { setDraftSaved(true); setTimeout(()=>setDraftSaved(false), 2000); })
            .catch(() => {});
    }, [form, dynVals, step]);

    const loadDraft = async () => {
        try {
            const raw = await AsyncStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const d = JSON.parse(raw);
            if (d.form) setFormRaw(p => ({ ...p, ...d.form }));
            if (d.dynVals) setDynVals(d.dynVals);
            if (typeof d.step === "number") setStep(d.step);
            setMode('manual'); // Always restore to manual mode
        } catch(_) {}
        setShowDraftModal(false);
    };

    const clearDraft = async () => {
        await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
        setShowDraftModal(false);
        // Reset everything and go back to mode selection
        setFormRaw({title:"",description:"",category:"",subcategory:"",condition:"",price:"",is_negotiable:false,locationRegion:"",locationCity:"",location:"",phone:""});
        setDynVals({}); setImages([]); setStep(0); setDrillPath([]);
    };

    // ── Fetch categories from API ─────────────────────────────────────────────
    useEffect(() => {
        fetch(`http://${DEV_IP}:3000/api/categories`)
            .then(r => r.json())
            .then(d => setApiCats(Array.isArray(d) ? d : (d.categories||[])))
            .catch(() => {});
    }, []);

    // ── canNext validation ─────────────────────────────────────────────────────
    const canNext = () => {
        if (step === 0) return form.title.trim().length >= 5;
        if (step === 1) return images.length > 0;
        if (step === 2) return !!form.category;
        if (step === 3) {
            const hasCondition = !!(form.condition || dynVals.condition);
            const noCondCat   = ["jobs","services","property"].includes(form.category);
            return hasCondition || noCondCat;
        }
        if (step === 4) return !!(form.locationRegion && form.locationCity);
        return true;
    };

    const STEPS = 6;
    const goNext = () => { setError(""); setStep(s => Math.min(s + 1, STEPS - 1)); };
    const goBack = () => { setError(""); setStep(s => Math.max(s - 1, 0)); };

    const stepLabels = ["Title","Photos","Category","Details","Location","Review"];

    // ── Image picker ──────────────────────────────────────────────────────────
    const openCamera = async () => {
        setShowPhotoModal(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") { Alert.alert("Permission needed","Allow camera access."); return; }
        const res = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true, quality: 0.85,
        });
        if (!res.canceled && res.assets) {
            const n = res.assets.map((a:any) => ({ id: Math.random().toString(36).slice(2), uri: a.uri }));
            setImages(p => [...p, ...n].slice(0, 10));
        }
    };

    const pickImages = async () => {
        setShowPhotoModal(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { Alert.alert("Permission needed","Allow photo library access."); return; }
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true, quality: 0.85,
            selectionLimit: 10 - images.length,
        });
        if (!res.canceled && res.assets) {
            const n = res.assets.map((a:any) => ({ id: Math.random().toString(36).slice(2), uri: a.uri }));
            setImages(p => [...p, ...n].slice(0, 10));
        }
    };

    // ── AI: Upload main image ─────────────────────────────────────────────────
    const pickAiMainImage = async (fromCamera=false) => {
        const { status } = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { Alert.alert("Permission needed","Allow photo access."); return; }
        const res = fromCamera
            ? await ImagePicker.launchCameraAsync({ mediaTypes:'images', allowsEditing:true, quality:0.9 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes:'images', quality:0.9 });
        if (!res.canceled && res.assets?.[0]) {
            const a = res.assets[0];
            setAiImage({ id: Math.random().toString(36).slice(2), uri: a.uri });
        }
    };

    const pickAiExtraImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") return;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true, quality:0.85,
            selectionLimit: 9 - aiExtraImages.length,
        });
        if (!res.canceled && res.assets) {
            const n = res.assets.map((a:any)=>({id:Math.random().toString(36).slice(2),uri:a.uri}));
            setAiExtraImages(p=>[...p,...n].slice(0,9));
        }
    };

    // ── AI: Run Gemini Vision scan (base64 → JSON, avoids RN FormData issues) ──
    const runAiScan = async () => {
        if (!aiImage) return;
        setAiStep('scanning');
        setAiError('');
        try {
            // Read image as base64 using expo-file-system (reliable in RN)
            const base64 = await FileSystem.readAsStringAsync(aiImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const ext = (aiImage.uri.split('.').pop() || 'jpg').toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            const res = await fetch(`http://${DEV_IP}:3000/api/ai/analyze-listing-image-base64`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64, mimeType }),
            });
            const data = await res.json();
            if (!res.ok || !data.analysis) throw new Error(data.error || 'AI scan failed');
            const a = data.analysis;
            setAiAnalysis(a);
            // Pre-fill form from AI response
            setAiFormRaw({
                title:       a.title || '',
                description: a.description || '',
                category:    a.category || a.subcategory || '',
                subcategory: a.subcategory || '',
                brand:       a.brand || '',
                model:       a.model || '',
                condition:   a.condition || '',
                price:       a.price_min ? String(Math.round((a.price_min + (a.price_max || a.price_min)) / 2)) : '',
                locationRegion: '', locationCity:'', location:'',
                is_negotiable: true,
            });
            // Populate specs from all returned AI fields
            const specs: Record<string,string> = {};
            const specKeys = ['storage','ram','screenSize','displayType','operatingSystem','battery','mainCamera','selfieCamera','processor','simType','cardSlot','color','year','mileage','bodyType','transmission','fuelType','gpu'];
            specKeys.forEach(k => { if ((a as any)[k]) specs[k] = String((a as any)[k]); });
            if (a.specifications) Object.entries(a.specifications).forEach(([k,v])=>{ specs[k]=String(v); });
            setAiSpecs(specs);
            setAiStep('review');
        } catch(err:any) {
            setAiError(err.message || 'AI could not analyze the image.');
            setAiStep('review'); // Let user fill manually
        }
    };

    // ── AI: Submit listing ─────────────────────────────────────────────────────
    const handleAiSubmit = async () => {
        if (aiSubmitting) return;
        setAiSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('title',       aiForm.title);
            payload.append('description', aiForm.description);
            payload.append('category',    aiForm.category);
            payload.append('subcategory', aiForm.subcategory);
            payload.append('brand',       aiForm.brand);
            payload.append('model',       aiForm.model);
            payload.append('condition',   aiForm.condition);
            payload.append('price',       aiForm.price);
            payload.append('is_negotiable', String(aiForm.is_negotiable));
            payload.append('location',    aiForm.location);
            payload.append('specs',       JSON.stringify(aiSpecs));
            payload.append('ai_generated', 'true');
            // Main AI image
            if (aiImage) {
                const ext = aiImage.uri.split('.').pop() || 'jpg';
                payload.append('images', { uri:aiImage.uri, name:`main.${ext}`, type:`image/${ext}` } as any);
            }
            // Extra images
            for (const img of aiExtraImages) {
                const ext = img.uri.split('.').pop() || 'jpg';
                payload.append('images', { uri:img.uri, name:`extra_${img.id}.${ext}`, type:`image/${ext}` } as any);
            }
            const res = await fetch(`http://${DEV_IP}:3000/api/listings`, { method:'POST', body:payload });
            if (!res.ok) throw new Error('Server error');
            await AsyncStorage.removeItem(DRAFT_KEY).catch(()=>{});
            Alert.alert('🎉 Listed!','Your listing is now live.',[
                { text:'View', onPress:()=>router.push('/(tabs)') },
                { text:'New Listing', onPress:()=>{ setMode('select'); setAiStep('upload'); setAiImage(null); setAiExtraImages([]); setAiAnalysis(null); setAiForm({title:'',description:'',category:'',subcategory:'',brand:'',model:'',condition:'',price:'',locationRegion:'',locationCity:'',location:'',is_negotiable:true}); } },
            ]);
        } catch(e) {
            Alert.alert('Error','Could not submit listing. Please try again.');
        } finally { setAiSubmitting(false); }
    };

    // ── AI: reset helper (fixes draft issue for AI mode) ─────────────────────
    const setAiForm = (v: any) => setAiFormRaw(v);

    // ── Submit listing ────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append("title",       form.title);
            payload.append("description", form.description);
            payload.append("category",    form.category);
            payload.append("subcategory", form.subcategory || "");
            payload.append("condition",   form.condition || dynVals.condition || "");
            payload.append("price",       form.price);
            payload.append("is_negotiable", String(form.is_negotiable));
            payload.append("location",    form.location);
            payload.append("open_to_trade", String(openToTrade));
            Object.entries(dynVals).forEach(([k,v]) => {
                if (k === "highlights" || k === "features" || k === "accessories") {
                    payload.append(k, JSON.stringify(v));
                } else if (v !== undefined && v !== null) {
                    payload.append(k, String(v));
                }
            });
            for (const img of images) {
                const ext = img.uri.split(".").pop() || "jpg";
                payload.append("images", { uri: img.uri, name: `photo_${img.id}.${ext}`, type: `image/${ext}` } as any);
            }
            const res = await fetch(`http://${DEV_IP}:3000/api/listings`, {
                method: "POST", body: payload,
            });
            if (!res.ok) throw new Error("Server error");
            await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
            Alert.alert("🎉 Listed!", "Your listing is now live.", [
                { text: "View", onPress: () => router.push("/(tabs)") },
                { text: "New Listing", onPress: () => { setFormRaw({title:"",description:"",category:"",subcategory:"",condition:"",price:"",is_negotiable:false,locationRegion:"",locationCity:"",location:"",phone:""}); setDynVals({}); setImages([]); setStep(0); } },
            ]);
        } catch(e) {
            Alert.alert("Error","Could not submit listing. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // STEP RENDERERS
    // ─────────────────────────────────────────────────────────────────────────

    // ── Step 0: Title ─────────────────────────────────────────────────────────
    const renderTitle = () => (
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined} keyboardVerticalOffset={100}>
            <ScrollView style={s.stepBody} contentContainerStyle={{paddingBottom:100}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={s.stepTitle}>Ad Title</Text>
                <Text style={s.stepSub}>Write a clear, descriptive title to attract buyers</Text>
                <TextInput
                    style={s.titleInput}
                    placeholder="e.g. Samsung Galaxy S24 Ultra 256GB Phantom Black..."
                    placeholderTextColor={C.textMuted}
                    value={form.title}
                    onChangeText={v => setField("title", v)}
                    maxLength={80}
                    returnKeyType="done"
                    autoFocus
                />
                <Text style={s.charCount}>{form.title.length}/80 characters</Text>
                <Text style={s.hintTxt}>💡 Tips for a great title:</Text>
                <Text style={s.hintItem}>• Include brand, model and key specs</Text>
                <Text style={s.hintItem}>• Mention condition (new, used, refurbished)</Text>
                <Text style={s.hintItem}>• Be specific and honest</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );

    // ── Step 1: Photos ────────────────────────────────────────────────────────
    const renderPhotos = () => (
        <ScrollView style={s.stepBody} contentContainerStyle={{paddingBottom:120}} showsVerticalScrollIndicator={false}>
            <Text style={s.stepTitle}>Add Photos</Text>
            <Text style={s.stepSub}>Listings with photos get <Text style={{color:C.primary,fontWeight:"700"}}>5× more views</Text></Text>
            <TouchableOpacity style={s.dropZone} onPress={()=>setShowPhotoModal(true)} activeOpacity={0.8}>
                <LinearGradient colors={[C.primarySubtle,"rgba(99,102,241,0.04)"]} style={s.dropInner} start={{x:0,y:0}} end={{x:0,y:1}}>
                    <View style={s.dropIconWrap}><Upload size={26} color={C.primary}/></View>
                    <Text style={s.dropTitle}>Tap to add photos</Text>
                    <Text style={s.dropSub}>Camera or Gallery · up to 10 photos</Text>
                </LinearGradient>
            </TouchableOpacity>
            {images.length > 0 && (
                <View>
                    <View style={s.photoHeader}>
                        <Text style={s.photoHeaderTxt}>Selected Photos</Text>
                        <View style={s.photoCntBadge}><Text style={s.photoCntTxt}>{images.length}/10</Text></View>
                    </View>
                    <View style={s.photoGrid}>
                        {images.map((img,idx)=>(
                            <View key={img.id} style={[s.photoCell, idx===0&&s.photoCellMain]}>
                                <Image source={{uri:img.uri}} style={s.photoImg}/>
                                {idx===0&&<View style={s.mainBadge}><Text style={s.mainBadgeTxt}>MAIN</Text></View>}
                                <TouchableOpacity style={s.removePhotoBtn} onPress={()=>setImages(p=>p.filter(i=>i.id!==img.id))}>
                                    <X size={10} color="#fff" strokeWidth={3}/>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < 10 && (
                            <TouchableOpacity style={s.addPhotoCell} onPress={()=>setShowPhotoModal(true)} activeOpacity={0.8}>
                                <Upload size={20} color={C.primary}/>
                                <Text style={s.addPhotoTxt}>Add More</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );

    // ── Step 2: Category Drilldown ────────────────────────────────────────────
    const catSlug = form.category || "";
    const lvl = drillPath.length;

    const getRows = () => {
        if (lvl === 0) {
            const cats = apiCats.length > 0 ? apiCats : [
                {id:"mobile-phones",name:"Mobile Phones",icon:"📱"},
                {id:"laptops",name:"Laptops & Computers",icon:"💻"},
                {id:"electronics",name:"Electronics",icon:"🔌"},
                {id:"vehicles",name:"Vehicles",icon:"🚗"},
                {id:"property",name:"Property",icon:"🏢"},
                {id:"fashion",name:"Fashion",icon:"👗"},
                {id:"home-appliances",name:"Home Appliances",icon:"🏠"},
                {id:"jobs",name:"Jobs",icon:"💼"},
                {id:"services",name:"Services",icon:"🔧"},
                {id:"furniture",name:"Furniture",icon:"🛋️"},
                {id:"sports",name:"Sports",icon:"⚽"},
                {id:"babies-kids",name:"Babies & Kids",icon:"🍼"},
                {id:"agriculture",name:"Agriculture",icon:"🌾"},
                {id:"other",name:"Other",icon:"📦"},
            ];
            return cats.map((c:any) => ({id:c.slug||c.id, label:c.name||c.label, icon:c.icon||"📦", hasSubs:true}));
        }
        if (lvl === 1) {
            const subs = getSubcats(drillPath[0], apiCats);
            return subs.map((s:any) => ({
                id: s.slug||s.id||"",
                label: s.name||s.label||"",
                icon: "",
                hasBrands: (()=>{
                    let b=(s.brands||[]).filter((x:any)=>!["other","other-brand"].includes((x.id||"").toLowerCase())).length>0;
                    if(!b){
                        const lc=DD[drillPath[0]];
                        if(lc){const ls=(lc.subcategories||[]).find((x:any)=>x.id===(s.slug||s.id)||x.slug===(s.slug||s.id));if(ls)b=(ls.brands||[]).filter((x:any)=>!["other","other-brand"].includes((x.id||"").toLowerCase())).length>0;}
                    }
                    return b;
                })(),
            }));
        }
        if (lvl === 2) {
            const subId = drillPath[1];
            let brands: any[] = [];
            const lc = DD[drillPath[0]];
            if (lc) {
                const ls = (lc.subcategories||[]).find((s:any)=>s.id===subId||s.slug===subId);
                if (ls) brands = (ls.brands||[]).filter((b:any)=>!["other","other-brand"].includes((b.id||"").toLowerCase()));
            }
            if (!brands.length) {
                const apiSub = getSubcats(drillPath[0],apiCats).find((s:any)=>(s.slug||s.id||"")===subId);
                brands = (apiSub?.brands||[]).filter((b:any)=>!["other","other-brand"].includes((b.id||"").toLowerCase()));
            }
            return [
                ...brands.map((b:any)=>({id:b.id||b.slug,label:b.label||b.name,icon:"",hasModels:(b.models||[]).length>0})),
                {id:"__other__",label:"Other / Not listed",icon:"",isOther:true},
            ];
        }
        if (lvl === 3) {
            const lc = DD[drillPath[0]];
            const ls = lc?(lc.subcategories||[]).find((s:any)=>s.id===drillPath[1]||s.slug===drillPath[1]):null;
            const brand = ls?(ls.brands||[]).find((b:any)=>(b.id||b.slug)===drillPath[2]):null;
            return [
                ...(brand?.models||[]).map((m:any)=>{const lbl=typeof m==="object"?m.label:m;const id=typeof m==="object"?(m.id??m.label):m;return{id,label:lbl,icon:"",isOther:false};}),
                {id:"__other__",label:"Other / Not listed",icon:"",isOther:true},
            ];
        }
        return [];
    };

    const onPickCat = (itemId: string, itemLabel: string) => {
        setError("");
        // Level 0: pick top category
        if (lvl === 0) {
            setField("category", itemId);
            setField("subcategory", "");
            setDrillPath([itemId]);
            return;
        }
        // Level 1: pick subcategory - check if has brands
        if (lvl === 1) {
            const sub = getSubcats(catSlug, apiCats).find((s:any)=>(s.slug||s.id||"")===itemId||String(s.id)===itemId);
            let brands = (sub?.brands||[]).filter((b:any)=>!["other"].includes((b.id||"").toLowerCase()));
            if (!brands.length) {
                const lc=DD[catSlug]; if(lc){const ls=(lc.subcategories||[]).find((s:any)=>s.id===itemId||s.slug===itemId||s.label===itemLabel);if(ls)brands=(ls.brands||[]).filter((b:any)=>!["other","other-brand"].includes((b.id||"").toLowerCase()));}
            }
            if (brands.length > 0) {
                setDrillPath(p=>[...p,itemId]);
            } else {
                setField("category", catSlug);
                setField("subcategory", itemId);
                setDynVals({category:sub?.name||sub?.label||itemLabel});
                setDrillSel({brand:false,model:false});
                setDrillPath([]);
                goNext();
            }
            return;
        }
        // Level 2: pick brand
        if (lvl === 2) {
            const subId = drillPath[1];
            const apiSub = getSubcats(catSlug,apiCats).find((s:any)=>(s.slug||String(s.id))===subId);
            const subLabel = apiSub?.name||apiSub?.label||subId;
            if (itemId === "__other__") {
                setField("category",catSlug); setField("subcategory",subId);
                setDynVals({brand:"Other",make:"Other",category:subLabel}); setDrillPath([]); goNext(); return;
            }
            const lc=DD[catSlug]; const ls=lc?(lc.subcategories||[]).find((s:any)=>s.id===subId||s.slug===subId):null;
            const brand=ls?(ls.brands||[]).find((b:any)=>(b.id||b.slug)===itemId):null;
            if (brand && (brand.models||[]).length > 0) {
                setDrillPath(p=>[...p,itemId]);
            } else {
                setField("category",catSlug); setField("subcategory",subId);
                setField("title",brand?.label||brand?.name||itemLabel);
                setDynVals({brand:brand?.label||brand?.name||itemLabel,make:brand?.label||brand?.name||itemLabel,...(brand?.defaults||{}),category:subLabel});
                setDrillSel({brand:true,model:false}); setDrillPath([]); goNext();
            }
            return;
        }
        // Level 3: pick model
        if (lvl === 3) {
            const lc=DD[catSlug]; const ls=lc?(lc.subcategories||[]).find((s:any)=>s.id===drillPath[1]||s.slug===drillPath[1]):null;
            const brand=ls?(ls.brands||[]).find((b:any)=>(b.id||b.slug)===drillPath[2]):null;
            const mEntry=brand?(brand.models||[]).find((m:any)=>(m.id??m.label??m)===itemId):null;
            const mLbl=typeof mEntry==="object"?mEntry.label:(mEntry||itemLabel);
            const slbl=ls?.label||drillPath[1];
            if (itemId === "__other__") {
                setField("category",catSlug); setField("subcategory",drillPath[1]);
                setDynVals({brand:brand?.label,make:brand?.label,model:"Other",category:slbl});
                setDrillSel({brand:true,model:true}); setDrillPath([]); goNext(); return;
            }
            setField("category",catSlug); setField("subcategory",drillPath[1]);
            setField("title",`${brand?.label||"" } ${mLbl}`.trim());
            setDynVals({brand:brand?.label||brand?.name,make:brand?.label||brand?.name,...(brand?.defaults||{}),model:mLbl,category:slbl});
            setDrillSel({brand:true,model:true}); setDrillPath([]); goNext();
        }
    };

    const renderCategory = () => {
        const rows = getRows();
        const breadcrumb = drillPath.length > 0;
        return (
            <View style={{flex:1}}>
                {breadcrumb && (
                    <View style={s.breadRow}>
                        <TouchableOpacity style={s.breadBack} onPress={()=>setDrillPath(p=>p.slice(0,-1))} activeOpacity={0.7}>
                            <ChevronLeft size={14} color={C.primary}/><Text style={s.breadBackTxt}>Back</Text>
                        </TouchableOpacity>
                        {drillPath.map((seg,i)=>(
                            <View key={i} style={{flexDirection:"row",alignItems:"center",gap:4}}>
                                <Text style={s.breadSep}>›</Text>
                                <Text style={[s.breadSeg,i===drillPath.length-1&&{color:C.textPrimary,fontWeight:"700"}]}>{seg}</Text>
                            </View>
                        ))}
                    </View>
                )}
                <ScrollView style={s.stepBody} contentContainerStyle={{paddingBottom:120}} showsVerticalScrollIndicator={false}>
                    <Text style={s.stepTitle}>
                        {lvl===0?"Select Category":lvl===1?"Select Type":lvl===2?"Select Brand":"Select Model"}
                    </Text>
                    {rows.map((row:any)=>(
                        <TouchableOpacity key={row.id} style={s.catRow} onPress={()=>onPickCat(row.id,row.label)} activeOpacity={0.75}>
                            <View style={{flex:1}}>
                                <Text style={[s.catRowTxt,row.isOther&&{color:C.textMuted}]}>
                                    {row.icon?`${row.icon}  `:""}{row.label}
                                </Text>
                            </View>
                            <ChevronRight size={16} color={C.textMuted}/>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    // ── Step 3: Details ────────────────────────────────────────────────────────
    const renderDetails = () => {
        const fields = CAT_FIELDS[catSlug] || CAT_FIELDS[form.subcategory] || [
            {key:"condition",label:"Condition",type:"select",opts:["Brand New","Used - Like New","Used - Good","Used - Fair"],required:true},
        ];
        const multiFields   = fields.filter((f:any)=>f.type==="multiselect");
        const regularFields = fields.filter((f:any)=>f.type!=="multiselect");

        const pickVal = (key:string, val:string) => {
            setDynVals(p=>(({...p,[key]:val})));
            if (key==="condition") setField("condition", val);
            setActiveSelect(null);
        };
        const toggleMulti = (key:string, val:string) => {
            setDynVals(p=>{const cur:string[]=Array.isArray(p[key])?p[key]:[];return{...p,[key]:cur.includes(val)?cur.filter((x:string)=>x!==val):[...cur,val]};});
        };
        const makeLabel  = dynVals.brand||dynVals.make||"";
        const modelLabel = dynVals.model||"";
        const catLabel   = dynVals.category||form.subcategory||catSlug;

        return (
            <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined} keyboardVerticalOffset={100}>
                <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,paddingBottom:40}} showsVerticalScrollIndicator={false}>
                    {/* Price */}
                    <Text style={d.sectionTitle}>Price (GHS)</Text>
                    <View style={d.priceRow}>
                        <View style={d.pricePrefix}><Text style={d.prefixTxt}>GHC</Text></View>
                        <TextInput style={d.priceInput} keyboardType="numeric" value={form.price} onChangeText={v=>setField("price",v)} placeholder="0" placeholderTextColor="#aaa"/>
                    </View>
                    {/* Make / Model */}
                    {(makeLabel||modelLabel)&&(
                        <View style={{marginBottom:16}}>
                            {makeLabel&&(<View style={{marginBottom:12}}><Text style={d.fieldLabel}>Make</Text><View style={d.changeRow}><Text style={d.changeVal}>{makeLabel}</Text><TouchableOpacity onPress={()=>{setDrillPath([]);setStep(2);}} activeOpacity={0.7}><Text style={d.changeTxt}>Change</Text></TouchableOpacity></View></View>)}
                            {modelLabel&&(<View><Text style={d.fieldLabel}>Model</Text><View style={d.changeRow}><Text style={d.changeVal}>{modelLabel}</Text><TouchableOpacity onPress={()=>{setDrillPath([]);setStep(2);}} activeOpacity={0.7}><Text style={d.changeTxt}>Change</Text></TouchableOpacity></View></View>)}
                        </View>
                    )}
                    {/* Category Details Card */}
                    <Text style={d.sectionTitle}>{catLabel?`${catLabel.charAt(0).toUpperCase()}${catLabel.slice(1)} Details`:"Details"}</Text>
                    <View style={d.detailsCard}>
                        {regularFields.map((f:any,i:number)=>{
                            const val = dynVals[f.key]||(form as any)[f.key]||"";
                            if (f.type==="select") return (
                                <View key={f.key} style={[d.fieldBlock,i>0&&d.fieldBorder]}>
                                    <Text style={d.fieldLabel}>{f.label}{f.required?" *":""}</Text>
                                    <TouchableOpacity style={d.selectRow} onPress={()=>setActiveSelect({key:f.key,label:f.label,opts:f.opts||[]})} activeOpacity={0.7}>
                                        <Text style={[d.selectVal,!val&&d.selectPlaceholder]}>{val||"Select..."}</Text>
                                        <Text style={d.chevron}>›</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                            return (
                                <View key={f.key} style={[d.fieldBlock,i>0&&d.fieldBorder]}>
                                    <Text style={d.fieldLabel}>{f.label}{f.required?" *":""}</Text>
                                    <View style={d.inputWrap}>
                                        <TextInput style={[d.textInput,f.unit&&{paddingRight:44}]} value={String(dynVals[f.key]||(form as any)[f.key]||"")} onChangeText={v=>setDynVals(p=>(({...p,[f.key]:v})))} placeholder={f.placeholder||""} placeholderTextColor="#bbb" keyboardType={f.type==="number"?"numeric":"default"}/>
                                        {f.unit&&<Text style={d.unitBadge}>{f.unit}</Text>}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    {/* Multiselect sections */}
                    {multiFields.map((f:any)=>{
                        const sel:string[]=Array.isArray(dynVals[f.key])?dynVals[f.key]:[];
                        return (
                            <View key={f.key} style={{marginTop:24}}>
                                <Text style={d.sectionTitle}>{f.label}</Text>
                                <View style={d.chipPool}>
                                    {(f.opts||[]).map((opt:string)=>{
                                        const active=sel.includes(opt);
                                        return (<TouchableOpacity key={opt} style={[d.chip,active&&d.chipActive]} onPress={()=>toggleMulti(f.key,opt)} activeOpacity={0.75}><Text style={[d.chipTxt,active&&d.chipTxtActive]}>{opt}</Text></TouchableOpacity>);
                                    })}
                                </View>
                            </View>
                        );
                    })}
                    {/* Description */}
                    <View style={{marginTop:24}}>
                        <Text style={d.sectionTitle}>Description</Text>
                        <TextInput style={d.descBox} multiline numberOfLines={8} value={form.description} onChangeText={v=>setField("description",v)} placeholder={`Describe your item in detail...\n• Condition & reason for selling\n• What's included\n• Any defects or damage`} placeholderTextColor="#bbb" textAlignVertical="top"/>
                        <Text style={d.charCount}>{(form.description||"").length} characters</Text>
                    </View>
                </ScrollView>
                {/* Select Picker Modal */}
                <Modal visible={!!activeSelect} transparent animationType="slide" onRequestClose={()=>setActiveSelect(null)}>
                    <TouchableOpacity style={d.modalOverlay} activeOpacity={1} onPress={()=>setActiveSelect(null)}/>
                    <View style={d.pickerSheet}>
                        <View style={d.pickerHandle}/>
                        <Text style={d.pickerTitle}>{activeSelect?.label||""}</Text>
                        <ScrollView style={{maxHeight:380}}>
                            {(activeSelect?.opts||[]).map((opt:string)=>{
                                const isSel=(dynVals[activeSelect!.key]||(form as any)[activeSelect!.key]||"")===opt;
                                return (<TouchableOpacity key={opt} style={[d.pickerOpt,isSel&&d.pickerOptActive]} onPress={()=>pickVal(activeSelect!.key,opt)} activeOpacity={0.7}><Text style={[d.pickerOptTxt,isSel&&d.pickerOptTxtActive]}>{opt}</Text>{isSel&&<Text style={{color:"#6366F1",fontSize:18}}>✓</Text>}</TouchableOpacity>);
                            })}
                        </ScrollView>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        );
    };

    // ── Step 4: Location & Options ─────────────────────────────────────────────
    const selectedRegionData = GHANA_REGIONS.find(r => r.value === form.locationRegion);
    const cityList = selectedRegionData?.districts || [];

    const renderLocation = () => (
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined} keyboardVerticalOffset={100}>
            <ScrollView style={s.stepBody} contentContainerStyle={{paddingBottom:140,padding:16}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={s.stepTitle}>Location</Text>
                {/* ── Region ── */}
                <Text style={l.fieldLabel}>Region *</Text>
                <TouchableOpacity style={l.selectBox} onPress={()=>setRegionPickerOpen(true)} activeOpacity={0.75}>
                    <Text style={[l.selectTxt,!form.locationRegion&&l.selectPlaceholder]}>{selectedRegionData?.label||"Select Region"}</Text>
                    <Text style={l.chevron}>›</Text>
                </TouchableOpacity>

                {/* ── City / Town (shown after region selected) ── */}
                {form.locationRegion && (
                    <View>
                        <Text style={[l.fieldLabel,{marginTop:14}]}>City / Town *</Text>
                        <TouchableOpacity style={l.selectBox} onPress={()=>setCityPickerOpen(true)} activeOpacity={0.75}>
                            <Text style={[l.selectTxt,!form.locationCity&&l.selectPlaceholder]}>{form.locationCity||"Select City / Town"}</Text>
                            <Text style={l.chevron}>›</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Location hint pill */}
                {(form.locationRegion||form.locationCity) && (
                    <View style={l.locationHint}>
                        <MapPin size={13} color={C.primary}/>
                        <Text style={l.locationHintTxt}>
                            {[form.locationCity,selectedRegionData?.label].filter(Boolean).join(", ")}, Ghana
                        </Text>
                    </View>
                )}
                <View style={{height:24}}/>
                <TouchableOpacity style={l.toggleCard} onPress={()=>setField("is_negotiable",!form.is_negotiable)} activeOpacity={0.85}>
                    <View style={l.toggleIconWrap}><Tag size={20} color={C.primary}/></View>
                    <View style={l.toggleBody}><Text style={l.toggleTitle}>Price is Negotiable</Text><Text style={l.toggleSub}>Let buyers know your price is flexible</Text></View>
                    <View style={[s.toggle,form.is_negotiable&&s.toggleOn]}><View style={[s.toggleThumb,form.is_negotiable&&s.toggleThumbOn]}/></View>
                </TouchableOpacity>
                <TouchableOpacity style={l.toggleCard} onPress={()=>setOpenToTrade(v=>!v)} activeOpacity={0.85}>
                    <View style={l.toggleIconWrap}><ArrowLeftRight size={20} color={C.primary}/></View>
                    <View style={l.toggleBody}><Text style={l.toggleTitle}>Open to Trade</Text><Text style={l.toggleSub}>Allow buyers to offer item swaps</Text></View>
                    <View style={[s.toggle,openToTrade&&s.toggleOn]}><View style={[s.toggleThumb,openToTrade&&s.toggleThumbOn]}/></View>
                </TouchableOpacity>
                <TouchableOpacity style={l.toggleCard} onPress={()=>setScheduleEnabled(v=>!v)} activeOpacity={0.85}>
                    <View style={l.toggleIconWrap}><Clock size={20} color={C.primary}/></View>
                    <View style={l.toggleBody}><Text style={l.toggleTitle}>Schedule Listing</Text><Text style={l.toggleSub}>Choose when your ad goes live</Text></View>
                    <View style={[s.toggle,scheduleEnabled&&s.toggleOn]}><View style={[s.toggleThumb,scheduleEnabled&&s.toggleThumbOn]}/></View>
                </TouchableOpacity>
            </ScrollView>
            {/* Region Picker */}
            <Modal visible={regionPickerOpen} transparent animationType="slide" onRequestClose={()=>setRegionPickerOpen(false)}>
                <TouchableOpacity style={l.modalOverlay} activeOpacity={1} onPress={()=>setRegionPickerOpen(false)}/>
                <View style={l.pickerSheet}>
                    <View style={l.pickerHandle}/>
                    <Text style={l.pickerTitle}>Select Region</Text>
                    <ScrollView style={{maxHeight:420}}>
                        {GHANA_REGIONS.map(r=>{
                            const isSel=form.locationRegion===r.value;
                            return (
                                <TouchableOpacity key={r.value} style={[l.pickerOpt,isSel&&l.pickerOptActive]}
                                    onPress={()=>{
                                        setField("locationRegion",r.value);
                                        setField("locationCity","");
                                        setField("location",r.label);
                                        setRegionPickerOpen(false);
                                    }} activeOpacity={0.7}
                                >
                                    <Text style={[l.pickerOptTxt,isSel&&l.pickerOptTxtActive]}>{r.label}</Text>
                                    {isSel&&<Text style={{color:C.primary,fontSize:18}}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Modal>

            {/* City Picker */}
            <Modal visible={cityPickerOpen} transparent animationType="slide" onRequestClose={()=>setCityPickerOpen(false)}>
                <TouchableOpacity style={l.modalOverlay} activeOpacity={1} onPress={()=>setCityPickerOpen(false)}/>
                <View style={l.pickerSheet}>
                    <View style={l.pickerHandle}/>
                    <Text style={l.pickerTitle}>Select City / Town</Text>
                    <ScrollView style={{maxHeight:440}}>
                        {cityList.map((city:string)=>{
                            const isSel=form.locationCity===city;
                            return (
                                <TouchableOpacity key={city} style={[l.pickerOpt,isSel&&l.pickerOptActive]}
                                    onPress={()=>{
                                        setField("locationCity",city);
                                        setField("location",`${city}, ${selectedRegionData?.label||""}`);
                                        setCityPickerOpen(false);
                                    }} activeOpacity={0.7}
                                >
                                    <Text style={[l.pickerOptTxt,isSel&&l.pickerOptTxtActive]}>{city}</Text>
                                    {isSel&&<Text style={{color:C.primary,fontSize:18}}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );

    // ── Step 5: Review ─────────────────────────────────────────────────────────
    const renderReview = () => (
        <ScrollView style={s.stepBody} contentContainerStyle={{paddingBottom:120,padding:16}} showsVerticalScrollIndicator={false}>
            <Text style={s.stepTitle}>Review & Post</Text>
            <Text style={s.stepSub}>Check your listing before publishing</Text>
            {[
                {label:"Title",       val:form.title},
                {label:"Category",    val:form.category},
                {label:"Condition",   val:form.condition||dynVals.condition},
                {label:"Price",       val:form.price?`GHC ${form.price}`:""},
                {label:"Location",    val:form.location},
                {label:"Make / Model",val:[dynVals.brand,dynVals.model].filter(Boolean).join(" / ")},
            ].map(row=>row.val?(
                <View key={row.label} style={s.reviewRow}>
                    <Text style={s.reviewLabel}>{row.label}</Text>
                    <Text style={s.reviewVal}>{row.val}</Text>
                </View>
            ):null)}
            <View style={s.reviewRow}>
                <Text style={s.reviewLabel}>Photos</Text>
                <Text style={s.reviewVal}>{images.length} photo{images.length!==1?"s":""}</Text>
            </View>
            {form.description?(
                <View style={{marginTop:12}}>
                    <Text style={s.reviewLabel}>Description</Text>
                    <Text style={[s.reviewVal,{marginTop:4,lineHeight:20}]}>{form.description}</Text>
                </View>
            ):null}
        </ScrollView>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // MODE SELECTION SCREEN
    // ─────────────────────────────────────────────────────────────────────────
    const renderModeSelect = () => (
        <View style={ai.modeRoot}>
            <View style={ai.modeHeader}>
                <Text style={ai.modeTitle}>Create a Listing</Text>
                <Text style={ai.modeSub}>How would you like to list your item?</Text>
            </View>

            {/* AI Mode Card */}
            <TouchableOpacity style={ai.modeCard} onPress={()=>setMode('ai')} activeOpacity={0.88}>
                <LinearGradient colors={["#6366F1","#8B5CF6"]} style={ai.modeCardGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <View style={ai.modeCardBadge}><Text style={ai.modeCardBadgeTxt}>✨ Recommended</Text></View>
                    <View style={ai.modeIconCircle}><Sparkles size={34} color="#fff"/></View>
                    <Text style={ai.modeCardTitle}>List with AI</Text>
                    <Text style={ai.modeCardDesc}>Take or upload a photo — our AI will fill in the title, description, category, specs, and suggest a price for you automatically.</Text>
                    <View style={ai.modeCardFeatures}>
                        {["📸 Upload one photo","🤖 AI fills all details","✍️ Review & edit","🚀 Publish in seconds"].map(f=>(
                            <View key={f} style={ai.modeFeatureRow}><Text style={ai.modeFeatureTxt}>{f}</Text></View>
                        ))}
                    </View>
                    <View style={ai.modeBtn}><Text style={ai.modeBtnTxt}>Start with AI →</Text></View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Manual Mode Card */}
            <TouchableOpacity style={[ai.modeCard,ai.modeCardManual]} onPress={()=>setMode('manual')} activeOpacity={0.85}>
                <View style={[ai.modeIconCircle,ai.modeIconManual]}><Pencil size={28} color="#6366F1"/></View>
                <Text style={[ai.modeCardTitle,ai.modeCardTitleManual]}>Fill in Manually</Text>
                <Text style={[ai.modeCardDesc,ai.modeCardDescManual]}>Enter all listing details step-by-step at your own pace.</Text>
                <View style={[ai.modeBtn,ai.modeBtnManual]}><Text style={[ai.modeBtnTxt,ai.modeBtnTxtManual]}>Continue Manually →</Text></View>
            </TouchableOpacity>
        </View>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // AI FLOW RENDERERS
    // ─────────────────────────────────────────────────────────────────────────

    // AI Step A: Upload photo
    const renderAiUpload = () => (
        <ScrollView style={s.stepBody} contentContainerStyle={{paddingBottom:140,padding:16}} showsVerticalScrollIndicator={false}>
            <Text style={s.stepTitle}>Upload a Photo</Text>
            <Text style={s.stepSub}>Take or choose a clear photo of your item — our AI will do the rest</Text>

            {!aiImage ? (
                <View style={ai.uploadZone}>
                    <LinearGradient colors={["#EEF2FF","rgba(99,102,241,0.04)"]} style={ai.uploadInner} start={{x:0,y:0}} end={{x:0,y:1}}>
                        <View style={ai.uploadIconCircle}><Sparkles size={32} color="#6366F1"/></View>
                        <Text style={ai.uploadTitle}>AI Photo Scan</Text>
                        <Text style={ai.uploadSub}>Our AI will analyze your photo and fill in all the details</Text>
                        <View style={ai.uploadBtns}>
                            <TouchableOpacity style={ai.uploadBtn} onPress={()=>pickAiMainImage(true)} activeOpacity={0.85}>
                                <Camera size={18} color="#fff"/><Text style={ai.uploadBtnTxt}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[ai.uploadBtn,ai.uploadBtnGallery]} onPress={()=>pickAiMainImage(false)} activeOpacity={0.85}>
                                <Upload size={18} color="#6366F1"/><Text style={[ai.uploadBtnTxt,ai.uploadBtnTxtGallery]}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            ) : (
                <View style={ai.previewWrap}>
                    <Image source={{uri:aiImage.uri}} style={ai.previewImg}/>
                    <TouchableOpacity style={ai.previewChange} onPress={()=>setAiImage(null)} activeOpacity={0.8}>
                        <RefreshCw size={14} color="#fff"/><Text style={ai.previewChangeTxt}>Change</Text>
                    </TouchableOpacity>
                    <View style={ai.previewBadge}><Sparkles size={12} color="#fff"/><Text style={ai.previewBadgeTxt}>Main Photo</Text></View>
                </View>
            )}

            {/* Extra photos */}
            {aiImage && (
                <View style={{marginTop:20}}>
                    <Text style={ai.extraTitle}>Add More Photos (Optional)</Text>
                    <Text style={ai.extraSub}>Up to 9 additional photos</Text>
                    <View style={s.photoGrid}>
                        {aiExtraImages.map(img=>(
                            <View key={img.id} style={s.photoCell}>
                                <Image source={{uri:img.uri}} style={s.photoImg}/>
                                <TouchableOpacity style={s.removePhotoBtn} onPress={()=>setAiExtraImages(p=>p.filter(i=>i.id!==img.id))}>
                                    <X size={10} color="#fff" strokeWidth={3}/>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {aiExtraImages.length < 9 && (
                            <TouchableOpacity style={s.addPhotoCell} onPress={pickAiExtraImages} activeOpacity={0.8}>
                                <Upload size={18} color="#6366F1"/>
                                <Text style={s.addPhotoTxt}>Add</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {aiImage && (
                <TouchableOpacity style={ai.scanBtn} onPress={runAiScan} activeOpacity={0.88}>
                    <LinearGradient colors={["#6366F1","#4338CA"]} style={ai.scanBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                        <Sparkles size={20} color="#fff"/>
                        <Text style={ai.scanBtnTxt}>Analyze with AI</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </ScrollView>
    );

    // AI Step B: Scanning animation
    const renderAiScanning = () => (
        <View style={ai.scanningRoot}>
            <View style={ai.scanningCard}>
                <View style={ai.scanningIconWrap}>
                    <View style={ai.scanningPulse}/>
                    <Sparkles size={48} color="#6366F1"/>
                </View>
                <Text style={ai.scanningTitle}>AI is analyzing your photo...</Text>
                <Text style={ai.scanningSub}>Identifying product, specs, and pricing</Text>
                <ActivityIndicator size="large" color="#6366F1" style={{marginTop:24}}/>
                <View style={ai.scanningSteps}>
                    {["🔍 Identifying product","📋 Extracting specifications","💰 Estimating market price","✍️ Writing description"].map((s,i)=>(
                        <View key={i} style={ai.scanningStepRow}>
                            <View style={ai.scanningStepDot}/>
                            <Text style={ai.scanningStepTxt}>{s}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    // AI Step C: Review & Edit prefilled fields
    const selectedAiRegion = GHANA_REGIONS.find(r=>r.value===aiForm.locationRegion);
    const aiCityList = selectedAiRegion?.districts || [];

    const renderAiReview = () => {
        const confidence = aiAnalysis?.confidence || 0;
        const pct = Math.round(confidence * 100);
        const confColor = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444';
        return (
            <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined} keyboardVerticalOffset={100}>
                <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,paddingBottom:60}} showsVerticalScrollIndicator={false}>
                    {/* AI result banner */}
                    {aiAnalysis ? (
                        <View style={[ai.resultBanner,{borderColor:confColor+'40',backgroundColor:confColor+'0F'}]}>
                            <View style={ai.resultBannerLeft}>
                                <Zap size={18} color={confColor}/>
                                <Text style={[ai.resultBannerTxt,{color:confColor}]}>AI filled {pct}% — review and edit below</Text>
                            </View>
                        </View>
                    ) : aiError ? (
                        <View style={ai.errorBanner}>
                            <Text style={ai.errorBannerTxt}>⚠️ {aiError} — please fill in manually below.</Text>
                        </View>
                    ) : null}

                    {/* Title */}
                    <Text style={d.sectionTitle}>Ad Title *</Text>
                    <TextInput style={ai.reviewInput} value={aiForm.title} onChangeText={v=>setAiField('title',v)} placeholder="e.g. Samsung Galaxy S24 Ultra 256GB" placeholderTextColor="#bbb" maxLength={80}/>
                    <Text style={s.charCount}>{aiForm.title.length}/80</Text>

                    {/* Price */}
                    <Text style={[d.sectionTitle,{marginTop:16}]}>Price (GHS) *</Text>
                    {aiAnalysis?.price_min && aiAnalysis?.price_max && (
                        <View style={ai.priceSuggest}>
                            <Zap size={13} color="#F59E0B"/>
                            <Text style={ai.priceSuggestTxt}>AI suggests: GHC {aiAnalysis.price_min.toLocaleString()} – {aiAnalysis.price_max.toLocaleString()}</Text>
                        </View>
                    )}
                    <View style={d.priceRow}>
                        <View style={d.pricePrefix}><Text style={d.prefixTxt}>GHC</Text></View>
                        <TextInput style={d.priceInput} keyboardType="numeric" value={aiForm.price} onChangeText={v=>setAiField('price',v)} placeholder="0" placeholderTextColor="#aaa"/>
                    </View>

                    {/* Brand / Model */}
                    <View style={{flexDirection:'row',gap:12,marginTop:16}}>
                        <View style={{flex:1}}>
                            <Text style={d.fieldLabel}>Brand</Text>
                            <TextInput style={ai.reviewInputSm} value={aiForm.brand} onChangeText={v=>setAiField('brand',v)} placeholder="e.g. Samsung" placeholderTextColor="#bbb"/>
                        </View>
                        <View style={{flex:1}}>
                            <Text style={d.fieldLabel}>Model</Text>
                            <TextInput style={ai.reviewInputSm} value={aiForm.model} onChangeText={v=>setAiField('model',v)} placeholder="e.g. Galaxy S24" placeholderTextColor="#bbb"/>
                        </View>
                    </View>

                    {/* Condition */}
                    <Text style={[d.fieldLabel,{marginTop:16}]}>Condition *</Text>
                    <View style={d.chipPool}>
                        {['Brand New','Used - Like New','Used - Good','Used - Fair','Foreign Used'].map(opt=>{
                            const active = aiForm.condition===opt;
                            return (<TouchableOpacity key={opt} style={[d.chip,active&&d.chipActive]} onPress={()=>setAiField('condition',opt)} activeOpacity={0.75}><Text style={[d.chipTxt,active&&d.chipTxtActive]}>{opt}</Text></TouchableOpacity>);
                        })}
                    </View>

                    {/* AI Specs */}
                    {Object.keys(aiSpecs).length > 0 && (
                        <View style={{marginTop:20}}>
                            <Text style={d.sectionTitle}>Detected Specs</Text>
                            <View style={ai.specsCard}>
                                {Object.entries(aiSpecs).map(([k,v])=>(
                                    <View key={k} style={ai.specRow}>
                                        <Text style={ai.specKey}>{k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</Text>
                                        <TextInput style={ai.specVal} value={v} onChangeText={nv=>setAiSpecs(p=>({...p,[k]:nv}))}/>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <Text style={[d.sectionTitle,{marginTop:20}]}>Description</Text>
                    <TextInput style={d.descBox} multiline numberOfLines={6} value={aiForm.description} onChangeText={v=>setAiField('description',v)} placeholder="Describe your item..." placeholderTextColor="#bbb" textAlignVertical="top"/>

                    {/* Location */}
                    <Text style={[d.sectionTitle,{marginTop:20}]}>Location *</Text>
                    <Text style={l.fieldLabel}>Region</Text>
                    <TouchableOpacity style={l.selectBox} onPress={()=>setRegionPickerOpen(true)} activeOpacity={0.75}>
                        <Text style={[l.selectTxt,!aiForm.locationRegion&&l.selectPlaceholder]}>{selectedAiRegion?.label||"Select Region"}</Text>
                        <Text style={l.chevron}>›</Text>
                    </TouchableOpacity>
                    {aiForm.locationRegion && (
                        <View>
                            <Text style={[l.fieldLabel,{marginTop:10}]}>City / Town</Text>
                            <TouchableOpacity style={l.selectBox} onPress={()=>setCityPickerOpen(true)} activeOpacity={0.75}>
                                <Text style={[l.selectTxt,!aiForm.locationCity&&l.selectPlaceholder]}>{aiForm.locationCity||"Select City / Town"}</Text>
                                <Text style={l.chevron}>›</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Negotiable toggle */}
                    <TouchableOpacity style={[l.toggleCard,{marginTop:16}]} onPress={()=>setAiField('is_negotiable',!aiForm.is_negotiable)} activeOpacity={0.85}>
                        <View style={l.toggleIconWrap}><Tag size={18} color="#6366F1"/></View>
                        <View style={l.toggleBody}><Text style={l.toggleTitle}>Price is Negotiable</Text><Text style={l.toggleSub}>Let buyers make offers</Text></View>
                        <View style={[s.toggle,aiForm.is_negotiable&&s.toggleOn]}><View style={[s.toggleThumb,aiForm.is_negotiable&&s.toggleThumbOn]}/></View>
                    </TouchableOpacity>

                    {/* Submit */}
                    <TouchableOpacity style={[ai.scanBtn,{marginTop:24}]} onPress={handleAiSubmit} disabled={aiSubmitting} activeOpacity={0.88}>
                        <LinearGradient colors={["#6366F1","#4338CA"]} style={ai.scanBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                            {aiSubmitting
                                ? <ActivityIndicator color="#fff" size="small"/>
                                : <><Sparkles size={20} color="#fff"/><Text style={ai.scanBtnTxt}>Post Listing 🚀</Text></>
                            }
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>

                {/* Region Picker for AI mode */}
                <Modal visible={regionPickerOpen} transparent animationType="slide" onRequestClose={()=>setRegionPickerOpen(false)}>
                    <TouchableOpacity style={l.modalOverlay} activeOpacity={1} onPress={()=>setRegionPickerOpen(false)}/>
                    <View style={l.pickerSheet}>
                        <View style={l.pickerHandle}/>
                        <Text style={l.pickerTitle}>Select Region</Text>
                        <ScrollView style={{maxHeight:420}}>
                            {GHANA_REGIONS.map(r=>{
                                const isSel=aiForm.locationRegion===r.value;
                                return (<TouchableOpacity key={r.value} style={[l.pickerOpt,isSel&&l.pickerOptActive]} onPress={()=>{setAiField('locationRegion',r.value);setAiField('locationCity','');setAiField('location',r.label);setRegionPickerOpen(false);}} activeOpacity={0.7}><Text style={[l.pickerOptTxt,isSel&&l.pickerOptTxtActive]}>{r.label}</Text>{isSel&&<Text style={{color:'#6366F1',fontSize:18}}>✓</Text>}</TouchableOpacity>);
                            })}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={cityPickerOpen} transparent animationType="slide" onRequestClose={()=>setCityPickerOpen(false)}>
                    <TouchableOpacity style={l.modalOverlay} activeOpacity={1} onPress={()=>setCityPickerOpen(false)}/>
                    <View style={l.pickerSheet}>
                        <View style={l.pickerHandle}/>
                        <Text style={l.pickerTitle}>Select City / Town</Text>
                        <ScrollView style={{maxHeight:440}}>
                            {aiCityList.map((city:string)=>{
                                const isSel=aiForm.locationCity===city;
                                return (<TouchableOpacity key={city} style={[l.pickerOpt,isSel&&l.pickerOptActive]} onPress={()=>{setAiField('locationCity',city);setAiField('location',`${city}, ${selectedAiRegion?.label||''}`);setCityPickerOpen(false);}} activeOpacity={0.7}><Text style={[l.pickerOptTxt,isSel&&l.pickerOptTxtActive]}>{city}</Text>{isSel&&<Text style={{color:'#6366F1',fontSize:18}}>✓</Text>}</TouchableOpacity>);
                            })}
                        </ScrollView>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────
    const stepContent = [renderTitle, renderPhotos, renderCategory, renderDetails, renderLocation, renderReview];

    // ── Mode: select screen ────────────────────────────────────────────────────
    if (mode === 'select') {
        return (
            <SafeAreaView style={s.root} edges={["top"]}>
                {renderModeSelect()}
                {/* Draft resume modal */}
                <Modal visible={showDraftModal} transparent animationType="fade" onRequestClose={()=>setShowDraftModal(false)}>
                    <View style={m.overlay}>
                        <View style={m.card}>
                            <Text style={m.title}>Resume Draft?</Text>
                            <Text style={m.sub}>You have an unfinished listing. Would you like to continue where you left off?</Text>
                            <TouchableOpacity style={[m.btn,m.btnPrimary]} onPress={loadDraft} activeOpacity={0.85}>
                                <Text style={m.btnTxt}>Continue Draft</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[m.btn,m.btnSecondary]} onPress={clearDraft} activeOpacity={0.85}>
                                <Text style={m.btnTxtSec}>Start Fresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }

    // ── Mode: AI flow ──────────────────────────────────────────────────────────
    if (mode === 'ai') {
        return (
            <SafeAreaView style={s.root} edges={["top"]}>
                {/* AI Header */}
                <View style={[s.header,{backgroundColor:'#6366F1'}]}>
                    <TouchableOpacity style={[s.headerBack,{backgroundColor:'rgba(255,255,255,0.2)'}]}
                        onPress={()=>{
                            if (aiStep==='review'||aiStep==='upload') { setMode('select'); setAiStep('upload'); setAiImage(null); }
                        }} activeOpacity={0.8}>
                        <ChevronLeft size={22} color="#fff"/>
                    </TouchableOpacity>
                    <View style={{flex:1,alignItems:'center'}}>
                        <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                            <Sparkles size={16} color="#fff"/>
                            <Text style={[s.headerTitle,{color:'#fff'}]}>AI Listing</Text>
                        </View>
                        <Text style={[s.headerSub,{color:'rgba(255,255,255,0.8)'}]}>
                            {aiStep==='upload'?'Upload Photo':aiStep==='scanning'?'AI Scanning...':'Review & Edit'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={()=>{setMode('select');setAiStep('upload');setAiImage(null);}} activeOpacity={0.7}>
                        <X size={22} color="#fff"/>
                    </TouchableOpacity>
                </View>

                {/* AI Progress */}
                <View style={[s.progressTrack,{backgroundColor:'rgba(99,102,241,0.2)'}]}>
                    <View style={[s.progressFill,{width:aiStep==='upload'?'33%':aiStep==='scanning'?'66%':'100%',backgroundColor:'#6366F1'}]}/>
                </View>

                <View style={{flex:1}}>
                    {aiStep==='upload'   && renderAiUpload()}
                    {aiStep==='scanning' && renderAiScanning()}
                    {aiStep==='review'   && renderAiReview()}
                </View>
            </SafeAreaView>
        );
    }

    // ── Mode: manual flow ─────────────────────────────────────────────────────
    return (
        <SafeAreaView style={s.root} edges={["top"]}>
            {/* ── Header ──────────────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity style={s.headerBack} onPress={()=>step===0?router.back():goBack()} activeOpacity={0.8}>
                    <ChevronLeft size={22} color={C.textPrimary}/>
                </TouchableOpacity>
                <View style={{flex:1,alignItems:"center"}}>
                    <Text style={s.headerTitle}>Post a Listing</Text>
                    <Text style={s.headerSub}>{stepLabels[step]}</Text>
                </View>
                <View style={{flexDirection:"row",alignItems:"center",gap:8}}>
                    {draftSaved&&<Text style={s.draftSavedTxt}>✓ Draft saved</Text>}
                    <TouchableOpacity style={s.clearDraftBtn} onPress={clearDraft} activeOpacity={0.8}>
                        <Text style={s.clearDraftTxt}>Clear{"\n"}Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.back()} activeOpacity={0.7}>
                        <X size={22} color={C.textSecondary}/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Progress bar ─────────────────────────────────────── */}
            <View style={s.progressTrack}>
                <View style={[s.progressFill,{width:`${((step+1)/STEPS)*100}%`}]}/>
            </View>

            {/* ── Step content ─────────────────────────────────────── */}
            <View style={{flex:1}}>
                {stepContent[step]?.()}
            </View>

            {/* ── Category skip bar ─────────────────────────────────── */}
            {step===2 && drillPath.length===0 && (
                <View style={s.footer}>
                    <TouchableOpacity style={s.skipBtn} onPress={()=>{if(form.category)goNext();}} activeOpacity={0.8}>
                        <Text style={s.skipBtnTxt}>{form.category?"Skip to Details →":"Select a category above"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Back / Continue footer ────────────────────────────── */}
            {step !== 2 && (
                <View style={s.footer}>
                    {error?<Text style={s.errTxt}>{error}</Text>:null}
                    <View style={s.footerRow}>
    
                        {step < STEPS - 1 ? (
                            <TouchableOpacity
                                style={[s.nextBtn,!canNext()&&s.nextBtnDim]}
                                onPress={()=>{
                                    if (!canNext()) {
                                        const msgs:Record<number,string>={0:"Please enter a title (at least 5 characters).",1:"Please add at least 1 photo.",2:"Please select a category.",3:"Please select a condition for your item.",4:"Please select your region and city / town."};
                                        setError(msgs[step]||"Please complete this step."); return;
                                    }
                                    goNext();
                                }}
                                activeOpacity={0.88}
                            >
                                <LinearGradient colors={[C.primary,C.primaryDark]} style={s.nextBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                                    <Text style={s.nextBtnTxt}>Continue</Text>
                                    <ChevronRight size={18} color="#fff"/>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={s.nextBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.88}>
                                <LinearGradient colors={[C.primary,C.primaryDark]} style={s.nextBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                                    {submitting?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.nextBtnTxt}>Post Listing 🚀</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* ── Draft Resume Modal ────────────────────────────────── */}
            <Modal visible={showDraftModal} transparent animationType="fade" onRequestClose={()=>setShowDraftModal(false)}>
                <View style={m.overlay}>
                    <View style={m.card}>
                        <Text style={m.title}>Resume Draft?</Text>
                        <Text style={m.sub}>You have an unfinished listing. Would you like to continue where you left off?</Text>
                        <TouchableOpacity style={[m.btn,m.btnPrimary]} onPress={loadDraft} activeOpacity={0.85}>
                            <Text style={m.btnTxt}>Continue Draft</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[m.btn,m.btnSecondary]} onPress={clearDraft} activeOpacity={0.85}>
                            <Text style={m.btnTxtSec}>Start Fresh</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ── Photo Source Modal ─────────────────────────────────── */}
            <Modal visible={showPhotoModal} transparent animationType="slide" onRequestClose={()=>setShowPhotoModal(false)}>
                <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={()=>setShowPhotoModal(false)}/>
                <View style={m.photoSheet}>
                    <View style={m.handle}/>
                    <Text style={m.sheetTitle}>Add Photos</Text>
                    <TouchableOpacity style={m.photoOpt} onPress={openCamera} activeOpacity={0.85}>
                        <View style={m.photoOptIcon}><Camera size={22} color="#6366F1"/></View>
                        <View><Text style={m.photoOptTxt}>Take a Photo</Text><Text style={m.photoOptSub}>Use your camera</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={m.photoOpt} onPress={pickImages} activeOpacity={0.85}>
                        <View style={m.photoOptIcon}><ImageIcon size={22} color="#6366F1"/></View>
                        <View><Text style={m.photoOptTxt}>Upload from Gallery</Text><Text style={m.photoOptSub}>Choose from your photo library</Text></View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root:           { flex:1, backgroundColor:C.bg },
    header:         { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:12, backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.border },
    headerBack:     { width:36, height:36, borderRadius:18, backgroundColor:C.bg, alignItems:"center", justifyContent:"center" },
    headerTitle:    { fontSize:16, fontWeight:"800", color:C.textPrimary },
    headerSub:      { fontSize:11, color:C.primary, fontWeight:"600", marginTop:1 },
    clearDraftBtn:  { backgroundColor:"#FEE2E2", borderRadius:8, paddingHorizontal:8, paddingVertical:4, borderWidth:1, borderColor:"#FECACA" },
    clearDraftTxt:  { fontSize:10, fontWeight:"700", color:"#DC2626", textAlign:"center", lineHeight:13 },
    draftSavedTxt:  { fontSize:11, color:C.success, fontWeight:"600" },
    progressTrack:  { height:3, backgroundColor:C.border },
    progressFill:   { height:3, backgroundColor:C.primary, borderRadius:2 },
    stepBody:       { flex:1, backgroundColor:C.bg },
    stepTitle:      { fontSize:22, fontWeight:"900", color:C.textPrimary, marginBottom:4, letterSpacing:-0.3, paddingHorizontal:16, paddingTop:16 },
    stepSub:        { fontSize:13, color:C.textSecondary, marginBottom:16, lineHeight:19, paddingHorizontal:16 },
    charCount:      { fontSize:11, color:C.textMuted, textAlign:"right", paddingHorizontal:16, marginTop:4 },
    hintTxt:        { fontSize:13, fontWeight:"700", color:C.textSecondary, paddingHorizontal:16, marginTop:16, marginBottom:6 },
    hintItem:       { fontSize:13, color:C.textSecondary, paddingHorizontal:16, marginBottom:3, lineHeight:20 },
    titleInput:     { marginHorizontal:16, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:14, paddingHorizontal:16, paddingVertical:12, fontSize:16, color:C.textPrimary, fontWeight:"600", height:50 },
    dropZone:       { marginHorizontal:16, marginBottom:16, borderRadius:16, overflow:"hidden", borderWidth:2, borderColor:C.primary, borderStyle:"dashed" },
    dropInner:      { padding:32, alignItems:"center", gap:10 },
    dropIconWrap:   { width:60, height:60, borderRadius:30, backgroundColor:C.surface, alignItems:"center", justifyContent:"center" },
    dropTitle:      { fontSize:16, fontWeight:"800", color:C.textPrimary },
    dropSub:        { fontSize:12, color:C.textMuted },
    photoHeader:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, marginBottom:12 },
    photoHeaderTxt: { fontSize:14, fontWeight:"700", color:C.textPrimary },
    photoCntBadge:  { backgroundColor:C.primarySubtle, paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
    photoCntTxt:    { fontSize:12, fontWeight:"700", color:C.primary },
    photoGrid:      { flexDirection:"row", flexWrap:"wrap", gap:8, paddingHorizontal:16 },
    photoCell:      { width:80, height:80, borderRadius:10, overflow:"hidden" },
    photoCellMain:  { width:160, height:160 },
    photoImg:       { width:"100%", height:"100%" },
    mainBadge:      { position:"absolute", top:6, left:6, backgroundColor:C.primary, borderRadius:6, paddingHorizontal:6, paddingVertical:2 },
    mainBadgeTxt:   { fontSize:10, fontWeight:"800", color:"#fff" },
    removePhotoBtn: { position:"absolute", top:4, right:4, backgroundColor:"rgba(0,0,0,0.6)", borderRadius:10, width:20, height:20, alignItems:"center", justifyContent:"center" },
    addPhotoCell:   { width:80, height:80, borderRadius:10, borderWidth:2, borderColor:C.border, borderStyle:"dashed", alignItems:"center", justifyContent:"center", gap:4, backgroundColor:C.surface },
    addPhotoTxt:    { fontSize:10, color:C.primary, fontWeight:"600" },
    catRow:         { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:15, backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.border },
    catRowTxt:      { fontSize:15, color:C.textPrimary, fontWeight:"500" },
    breadRow:       { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:10, backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.border, gap:4, flexWrap:"wrap" },
    breadBack:      { flexDirection:"row", alignItems:"center", gap:2, backgroundColor:C.primarySubtle, paddingHorizontal:10, paddingVertical:5, borderRadius:20 },
    breadBackTxt:   { fontSize:12, fontWeight:"700", color:C.primary },
    breadSep:       { color:C.textMuted, fontSize:12 },
    breadSeg:       { fontSize:12, fontWeight:"600", color:C.textSecondary },
    reviewRow:      { flexDirection:"row", justifyContent:"space-between", paddingVertical:12, borderBottomWidth:1, borderBottomColor:C.border },
    reviewLabel:    { fontSize:13, color:C.textMuted, fontWeight:"600" },
    reviewVal:      { fontSize:14, color:C.textPrimary, fontWeight:"600", flex:1, textAlign:"right" },
    footer:         { paddingHorizontal:16, paddingTop:12, paddingBottom:48, backgroundColor:C.surface, borderTopWidth:1, borderTopColor:C.border },
    footerRow:      { flexDirection:"row", alignItems:"center", gap:10 },
    backBtn:        { flexDirection:"row", alignItems:"center", paddingHorizontal:18, paddingVertical:14, borderRadius:14, backgroundColor:C.bg, borderWidth:1, borderColor:C.border, gap:4 },
    backBtnTxt:     { fontSize:14, fontWeight:"700", color:C.textSecondary },
    nextBtn:        { flex:1, borderRadius:14, overflow:"hidden" },
    nextBtnDim:     { opacity:0.5 },
    nextBtnGrad:    { flexDirection:"row", alignItems:"center", justifyContent:"center", paddingVertical:15, gap:8 },
    nextBtnTxt:     { fontSize:15, fontWeight:"800", color:"#fff" },
    skipBtn:        { padding:14, alignItems:"center" },
    skipBtnTxt:     { fontSize:14, fontWeight:"700", color:C.primary },
    errTxt:         { fontSize:12, color:C.error, textAlign:"center", marginBottom:8 },
    toggle:         { width:44, height:24, borderRadius:12, backgroundColor:C.border, justifyContent:"center", paddingHorizontal:2 },
    toggleOn:       { backgroundColor:C.primary },
    toggleThumb:    { width:20, height:20, borderRadius:10, backgroundColor:"#fff" },
    toggleThumbOn:  { transform:[{translateX:20}] },
});

// Details StyleSheet
const d = StyleSheet.create({
    sectionTitle:    { fontSize:16, fontWeight:"800", color:"#1a1a2e", marginBottom:10, letterSpacing:-0.2 },
    priceRow:        { flexDirection:"row", alignItems:"center", borderWidth:1, borderColor:"#e9ecef", borderRadius:12, overflow:"hidden", marginBottom:20, backgroundColor:"#fff" },
    pricePrefix:     { backgroundColor:"#f1f3f5", paddingHorizontal:14, paddingVertical:14, borderRightWidth:1, borderRightColor:"#e9ecef" },
    prefixTxt:       { fontSize:14, fontWeight:"700", color:"#495057" },
    priceInput:      { flex:1, fontSize:22, fontWeight:"800", color:"#1a1a2e", paddingHorizontal:14, paddingVertical:12 },
    fieldLabel:      { fontSize:13, fontWeight:"600", color:"#495057", marginBottom:6 },
    changeRow:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:"#fff", borderWidth:1, borderColor:"#e9ecef", borderRadius:12, paddingHorizontal:16, paddingVertical:14 },
    changeVal:       { fontSize:15, fontWeight:"600", color:"#1a1a2e" },
    changeTxt:       { fontSize:13, fontWeight:"700", color:"#6366F1" },
    detailsCard:     { backgroundColor:"#fff", borderRadius:16, borderWidth:1, borderColor:"#e9ecef", overflow:"hidden", marginBottom:8, elevation:2, shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4 },
    fieldBlock:      { paddingHorizontal:16, paddingVertical:14 },
    fieldBorder:     { borderTopWidth:1, borderTopColor:"#f1f3f5" },
    selectRow:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:"#f8f9fa", borderRadius:10, paddingHorizontal:14, paddingVertical:12, borderWidth:1, borderColor:"#e9ecef" },
    selectVal:       { fontSize:15, color:"#1a1a2e", fontWeight:"500", flex:1 },
    selectPlaceholder:{ color:"#adb5bd" },
    chevron:         { fontSize:20, color:"#adb5bd", marginLeft:8 },
    inputWrap:       { position:"relative", flexDirection:"row", alignItems:"center" },
    textInput:       { flex:1, backgroundColor:"#f8f9fa", borderRadius:10, paddingHorizontal:14, paddingVertical:12, fontSize:15, color:"#1a1a2e", borderWidth:1, borderColor:"#e9ecef" },
    unitBadge:       { position:"absolute", right:12, fontSize:13, fontWeight:"600", color:"#6c757d" },
    chipPool:        { flexDirection:"row", flexWrap:"wrap", gap:8 },
    chip:            { paddingHorizontal:14, paddingVertical:8, borderRadius:50, backgroundColor:"#f1f3f5", borderWidth:1, borderColor:"#e9ecef" },
    chipActive:      { backgroundColor:"#eef2ff", borderColor:"#6366F1" },
    chipTxt:         { fontSize:13, color:"#495057", fontWeight:"500" },
    chipTxtActive:   { color:"#4338ca", fontWeight:"700" },
    descBox:         { backgroundColor:"#fff", borderWidth:1, borderColor:"#e9ecef", borderRadius:14, padding:16, fontSize:14, color:"#1a1a2e", minHeight:240, lineHeight:22 },
    charCount:       { fontSize:11, color:"#adb5bd", textAlign:"right", marginTop:4 },
    modalOverlay:    { flex:1, backgroundColor:"rgba(0,0,0,0.4)" },
    pickerSheet:     { backgroundColor:"#fff", borderTopLeftRadius:20, borderTopRightRadius:20, padding:20, paddingBottom:40 },
    pickerHandle:    { width:40, height:4, backgroundColor:"#dee2e6", borderRadius:2, alignSelf:"center", marginBottom:16 },
    pickerTitle:     { fontSize:16, fontWeight:"800", color:"#1a1a2e", marginBottom:12, textAlign:"center" },
    pickerOpt:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:14, paddingHorizontal:4, borderBottomWidth:1, borderBottomColor:"#f8f9fa" },
    pickerOptActive: { backgroundColor:"#eef2ff", borderRadius:10, paddingHorizontal:12 },
    pickerOptTxt:    { fontSize:15, color:"#1a1a2e" },
    pickerOptTxtActive:{ color:"#4338ca", fontWeight:"700" },
});

// Location StyleSheet
const l = StyleSheet.create({
    fieldLabel:       { fontSize:13, fontWeight:"700", color:C.textSecondary, marginBottom:6 },
    selectBox:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:"#fff", borderWidth:1, borderColor:"#e9ecef", borderRadius:12, paddingHorizontal:16, paddingVertical:14, marginBottom:8 },
    selectTxt:        { fontSize:15, color:"#1a1a2e", fontWeight:"500" },
    selectPlaceholder:{ color:"#adb5bd" },
    chevron:          { fontSize:22, color:"#adb5bd" },
    locationHint:     { flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:2, marginBottom:4 },
    locationHintTxt:  { fontSize:13, color:"#6366F1", fontWeight:"600" },
    toggleCard:       { flexDirection:"row", alignItems:"center", backgroundColor:"#fff", borderRadius:14, borderWidth:1, borderColor:"#e9ecef", padding:16, marginBottom:12, gap:14, elevation:1 },
    toggleIconWrap:   { width:44, height:44, borderRadius:22, backgroundColor:"#eef2ff", alignItems:"center", justifyContent:"center" },
    toggleBody:       { flex:1 },
    toggleTitle:      { fontSize:15, fontWeight:"700", color:"#1a1a2e", marginBottom:2 },
    toggleSub:        { fontSize:12, color:"#6c757d", lineHeight:18 },
    modalOverlay:     { flex:1, backgroundColor:"rgba(0,0,0,0.45)" },
    pickerSheet:      { backgroundColor:"#fff", borderTopLeftRadius:22, borderTopRightRadius:22, padding:20, paddingBottom:44 },
    pickerHandle:     { width:40, height:4, backgroundColor:"#dee2e6", borderRadius:2, alignSelf:"center", marginBottom:18 },
    pickerTitle:      { fontSize:17, fontWeight:"800", color:"#1a1a2e", marginBottom:14, textAlign:"center" },
    pickerOpt:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:14, paddingHorizontal:4, borderBottomWidth:1, borderBottomColor:"#f8f9fa" },
    pickerOptActive:  { backgroundColor:"#eef2ff", borderRadius:10, paddingHorizontal:12, marginHorizontal:-12 },
    pickerOptTxt:     { fontSize:15, color:"#1a1a2e" },
    pickerOptTxtActive:{ color:"#4338ca", fontWeight:"700" },
});

// Modal StyleSheet
const m = StyleSheet.create({
    overlay:       { flex:1, backgroundColor:"rgba(0,0,0,0.5)", alignItems:"center", justifyContent:"center", padding:24 },
    card:          { backgroundColor:"#fff", borderRadius:20, padding:24, width:"100%" },
    title:         { fontSize:20, fontWeight:"900", color:"#1a1a2e", marginBottom:8, textAlign:"center" },
    sub:           { fontSize:14, color:"#6c757d", textAlign:"center", lineHeight:20, marginBottom:24 },
    btn:           { paddingVertical:14, borderRadius:12, alignItems:"center", marginBottom:10 },
    btnPrimary:    { backgroundColor:"#6366F1" },
    btnSecondary:  { backgroundColor:"#f1f3f5", borderWidth:1, borderColor:"#e9ecef" },
    btnTxt:        { fontSize:15, fontWeight:"700", color:"#fff" },
    btnTxtSec:     { fontSize:15, fontWeight:"700", color:"#495057" },
    photoSheet:    { backgroundColor:"#fff", borderTopLeftRadius:22, borderTopRightRadius:22, padding:24, paddingBottom:48 },
    handle:        { width:40, height:4, backgroundColor:"#dee2e6", borderRadius:2, alignSelf:"center", marginBottom:18 },
    sheetTitle:    { fontSize:17, fontWeight:"800", color:"#1a1a2e", marginBottom:16, textAlign:"center" },
    photoOpt:      { flexDirection:"row", alignItems:"center", gap:16, padding:18, backgroundColor:"#f8f9fa", borderRadius:14, marginBottom:12, borderWidth:1, borderColor:"#e9ecef" },
    photoOptIcon:  { width:46, height:46, borderRadius:23, backgroundColor:"#eef2ff", alignItems:"center", justifyContent:"center" },
    photoOptTxt:   { fontSize:16, fontWeight:"700", color:"#1a1a2e" },
    photoOptSub:   { fontSize:12, color:"#6c757d", marginTop:2 },
});


// AI Flow StyleSheet
const ai = StyleSheet.create({
    // Mode selection
    modeRoot:          { flex:1, padding:20, backgroundColor:"#F8F9FA" },
    modeHeader:        { marginBottom:24, paddingTop:8 },
    modeTitle:         { fontSize:28, fontWeight:"900", color:"#1a1a2e", letterSpacing:-0.5 },
    modeSub:           { fontSize:15, color:"#6c757d", marginTop:4 },
    modeCard:          { borderRadius:20, overflow:"hidden", marginBottom:16 },
    modeCardGrad:      { padding:24 },
    modeCardManual:    { backgroundColor:"#fff", borderWidth:1, borderColor:"#e9ecef", padding:24 },
    modeCardBadge:     { alignSelf:"flex-start", backgroundColor:"rgba(255,255,255,0.25)", borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginBottom:16 },
    modeCardBadgeTxt:  { fontSize:12, fontWeight:"700", color:"#fff" },
    modeIconCircle:    { width:64, height:64, borderRadius:32, backgroundColor:"rgba(255,255,255,0.2)", alignItems:"center", justifyContent:"center", marginBottom:16 },
    modeIconManual:    { backgroundColor:"#EEF2FF" },
    modeCardTitle:     { fontSize:22, fontWeight:"900", color:"#fff", marginBottom:8 },
    modeCardTitleManual:{ color:"#1a1a2e" },
    modeCardDesc:      { fontSize:14, color:"rgba(255,255,255,0.85)", lineHeight:22, marginBottom:16 },
    modeCardDescManual:{ color:"#6c757d" },
    modeCardFeatures:  { marginBottom:20, gap:6 },
    modeFeatureRow:    { flexDirection:"row", alignItems:"center" },
    modeFeatureTxt:    { fontSize:13, color:"rgba(255,255,255,0.9)", fontWeight:"500" },
    modeBtn:           { backgroundColor:"rgba(255,255,255,0.25)", borderRadius:12, paddingVertical:12, alignItems:"center", borderWidth:1, borderColor:"rgba(255,255,255,0.3)" },
    modeBtnManual:     { backgroundColor:"#EEF2FF", borderColor:"#6366F1" },
    modeBtnTxt:        { fontSize:15, fontWeight:"700", color:"#fff" },
    modeBtnTxtManual:  { color:"#6366F1" },
    // Upload
    uploadZone:        { borderRadius:16, overflow:"hidden", borderWidth:2, borderColor:"#6366F1", borderStyle:"dashed", marginBottom:16 },
    uploadInner:       { padding:32, alignItems:"center", gap:12 },
    uploadIconCircle:  { width:70, height:70, borderRadius:35, backgroundColor:"#fff", alignItems:"center", justifyContent:"center", elevation:3 },
    uploadTitle:       { fontSize:18, fontWeight:"800", color:"#1a1a2e" },
    uploadSub:         { fontSize:13, color:"#6c757d", textAlign:"center", lineHeight:18 },
    uploadBtns:        { flexDirection:"row", gap:12, marginTop:8 },
    uploadBtn:         { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, backgroundColor:"#6366F1", borderRadius:12, paddingVertical:13 },
    uploadBtnGallery:  { backgroundColor:"#EEF2FF", borderWidth:1, borderColor:"#6366F1" },
    uploadBtnTxt:      { fontSize:14, fontWeight:"700", color:"#fff" },
    uploadBtnTxtGallery:{ color:"#6366F1" },
    previewWrap:       { borderRadius:16, overflow:"hidden", marginBottom:8, position:"relative", width:"100%" },
    previewImg:        { width:"100%", height:300, borderRadius:16, backgroundColor:"#eee" },
    previewChange:     { position:"absolute", top:12, right:12, flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"rgba(0,0,0,0.6)", borderRadius:20, paddingHorizontal:12, paddingVertical:6 },
    previewChangeTxt:  { fontSize:12, fontWeight:"700", color:"#fff" },
    previewBadge:      { position:"absolute", top:12, left:12, flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"#6366F1", borderRadius:20, paddingHorizontal:12, paddingVertical:6 },
    previewBadgeTxt:   { fontSize:11, fontWeight:"700", color:"#fff" },
    extraTitle:        { fontSize:15, fontWeight:"700", color:"#1a1a2e", marginBottom:4 },
    extraSub:          { fontSize:12, color:"#6c757d", marginBottom:12 },
    scanBtn:           { borderRadius:16, overflow:"hidden", marginTop:20 },
    scanBtnGrad:       { flexDirection:"row", alignItems:"center", justifyContent:"center", paddingVertical:16, gap:10 },
    scanBtnTxt:        { fontSize:16, fontWeight:"800", color:"#fff" },
    // Scanning
    scanningRoot:      { flex:1, alignItems:"center", justifyContent:"center", padding:24, backgroundColor:"#F8F9FA" },
    scanningCard:      { backgroundColor:"#fff", borderRadius:24, padding:32, alignItems:"center", width:"100%", elevation:4, shadowColor:"#6366F1", shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:16 },
    scanningIconWrap:  { position:"relative", marginBottom:20 },
    scanningPulse:     { position:"absolute", width:100, height:100, borderRadius:50, backgroundColor:"#EEF2FF", top:-14, left:-14 },
    scanningTitle:     { fontSize:20, fontWeight:"900", color:"#1a1a2e", textAlign:"center", marginBottom:8 },
    scanningSub:       { fontSize:14, color:"#6c757d", textAlign:"center", lineHeight:20 },
    scanningSteps:     { marginTop:20, gap:10, width:"100%" },
    scanningStepRow:   { flexDirection:"row", alignItems:"center", gap:10 },
    scanningStepDot:   { width:8, height:8, borderRadius:4, backgroundColor:"#6366F1" },
    scanningStepTxt:   { fontSize:13, color:"#495057", fontWeight:"500" },
    // Review
    resultBanner:      { flexDirection:"row", alignItems:"center", padding:12, borderRadius:12, borderWidth:1, marginBottom:16 },
    resultBannerLeft:  { flexDirection:"row", alignItems:"center", gap:8 },
    resultBannerTxt:   { fontSize:13, fontWeight:"700" },
    errorBanner:       { backgroundColor:"#FEF3C7", borderRadius:12, padding:12, marginBottom:16, borderWidth:1, borderColor:"#FDE68A" },
    errorBannerTxt:    { fontSize:13, color:"#92400E", fontWeight:"500" },
    reviewInput:       { backgroundColor:"#fff", borderWidth:1, borderColor:"#e9ecef", borderRadius:12, paddingHorizontal:14, paddingVertical:12, fontSize:15, color:"#1a1a2e", fontWeight:"500" },
    reviewInputSm:     { backgroundColor:"#fff", borderWidth:1, borderColor:"#e9ecef", borderRadius:12, paddingHorizontal:12, paddingVertical:11, fontSize:14, color:"#1a1a2e" },
    priceSuggest:      { flexDirection:"row", alignItems:"center", gap:6, marginBottom:8 },
    priceSuggestTxt:   { fontSize:12, color:"#F59E0B", fontWeight:"600" },
    specsCard:         { backgroundColor:"#fff", borderRadius:14, borderWidth:1, borderColor:"#e9ecef", overflow:"hidden" },
    specRow:           { flexDirection:"row", alignItems:"center", paddingHorizontal:14, paddingVertical:10, borderBottomWidth:1, borderBottomColor:"#f8f9fa" },
    specKey:           { fontSize:13, color:"#495057", fontWeight:"600", width:130 },
    specVal:           { flex:1, fontSize:13, color:"#1a1a2e", paddingVertical:2, borderBottomWidth:1, borderBottomColor:"#e9ecef" },
});

