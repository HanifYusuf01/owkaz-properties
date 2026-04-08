export interface LgaOption {
  value: string;
  label: string;
}

export interface StateData {
  value: string;
  label: string;
  lgas: LgaOption[];
}

function createLgas(names: string[]): LgaOption[] {
  return names.map((name) => ({ value: name, label: name }));
}

export const NIGERIAN_STATES: StateData[] = [
  {
    value: "fct",
    label: "FCT",
    lgas: createLgas([
      "Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"
    ]),
  },
  {
    value: "abia",
    label: "Abia",
    lgas: createLgas([
      "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North",
      "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma Ngwa",
      "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"
    ]),
  },
  {
    value: "adamawa",
    label: "Adamawa",
    lgas: createLgas([
      "Demsa", "Fufore", "Ganye", "Gombi", "Guyuk", "Hong", "Jada",
      "Lamurde", "Madagali", "Maiha", "Mayo-Belwa", "Michika", "Mubi North",
      "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"
    ]),
  },
  {
    value: "akwa-ibom",
    label: "Akwa Ibom",
    lgas: createLgas([
      "Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo",
      "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi",
      "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom",
      "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam",
      "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"
    ]),
  },
  {
    value: "anambra",
    label: "Anambra",
    lgas: createLgas([
      "Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South",
      "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South",
      "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North",
      "Onitsha South", "Orumba North", "Orumba South", "Oyi"
    ]),
  },
  {
    value: "bauchi",
    label: "Bauchi",
    lgas: createLgas([
      "Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Ganjuwa",
      "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi",
      "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"
    ]),
  },
  {
    value: "bayelsa",
    label: "Bayelsa",
    lgas: createLgas([
      "Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama",
      "Southern Ijaw", "Yenagoa"
    ]),
  },
  {
    value: "benue",
    label: "Benue",
    lgas: createLgas([
      "Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West",
      "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo",
      "Ohimini", "Oju", "Okpokwu", "Oturkpo", "Tarka", "Ukum", "Vandeikya"
    ]),
  },
  {
    value: "borno",
    label: "Borno",
    lgas: createLgas([
      "Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa",
      "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga",
      "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri",
      "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"
    ]),
  },
  {
    value: "cross-river",
    label: "Cross River",
    lgas: createLgas([
      "Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki",
      "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra",
      "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"
    ]),
  },
  {
    value: "delta",
    label: "Delta",
    lgas: createLgas([
      "Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East",
      "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South",
      "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South",
      "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani",
      "Uvwie", "Warri North", "Warri South", "Warri South West"
    ]),
  },
  {
    value: "ebonyi",
    label: "Ebonyi",
    lgas: createLgas([
      "Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North",
      "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu",
      "Onicha"
    ]),
  },
  {
    value: "edo",
    label: "Edo",
    lgas: createLgas([
      "Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East",
      "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben",
      "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West",
      "Owan East", "Owan West", "Uhunmwonde"
    ]),
  },
  {
    value: "ekiti",
    label: "Ekiti",
    lgas: createLgas([
      "Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West",
      "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje",
      "Irewole", "Ise/Orun", "Moba", "Oye"
    ]),
  },
  {
    value: "enugu",
    label: "Enugu",
    lgas: createLgas([
      "Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu",
      "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East",
      "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo-Uwani"
    ]),
  },
  {
    value: "gombe",
    label: "Gombe",
    lgas: createLgas([
      "Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo",
      "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"
    ]),
  },
  {
    value: "imo",
    label: "Imo",
    lgas: createLgas([
      "Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North",
      "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli",
      "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema",
      "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Osisioma", "Owerri Municipal",
      "Owerri North", "Owerri West", "Unuimo"
    ]),
  },
  {
    value: "jigawa",
    label: "Jigawa",
    lgas: createLgas([
      "Auyo", "Babura", "Buji", "Biriniwa", "Birnin Kudu", "Dutse", "Gagarawa",
      "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa",
      "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari",
      "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"
    ]),
  },
  {
    value: "kaduna",
    label: "Kaduna",
    lgas: createLgas([
      "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a",
      "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura",
      "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sanga", "Sabon Gari",
      "Soba", "Zangon Kataf", "Zaria"
    ]),
  },
  {
    value: "kano",
    label: "Kano",
    lgas: createLgas([
      "Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala",
      "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa",
      "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo",
      "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura",
      "Madobi", "Makoda", "Minjibir", "Nassarawa", "Rano", "Rimin Gado", "Rogo",
      "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada",
      "Ungogo", "Warawa", "Wudil"
    ]),
  },
  {
    value: "katsina",
    label: "Katsina",
    lgas: createLgas([
      "Bakori", "Batagarawa", "Bindawa", "Charanchi", "Dan Musa", "Dandume",
      "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia",
      "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada",
      "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi",
      "Sabua", "Safana", "Sandamu", "Zango"
    ]),
  },
  {
    value: "kebbi",
    label: "Kebbi",
    lgas: createLgas([
      "Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi",
      "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse",
      "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri",
      "Zuru"
    ]),
  },
  {
    value: "kogi",
    label: "Kogi",
    lgas: createLgas([
      "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah",
      "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa-Muro",
      "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East",
      "Yagba West"
    ]),
  },
  {
    value: "kwara",
    label: "Kwara",
    lgas: createLgas([
      "Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South",
      "Ilorin West", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"
    ]),
  },
  {
    value: "lagos",
    label: "Lagos",
    lgas: createLgas([
      "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry",
      "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe",
      "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu",
      "Surulere"
    ]),
  },
  {
    value: "nasarawa",
    label: "Nasarawa",
    lgas: createLgas([
      "Akwanga", "Awe", "Doma", "Karue", "Keana", "Keffi", "Kokona", "Lafia",
      "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"
    ]),
  },
  {
    value: "niger",
    label: "Niger",
    lgas: createLgas([
      "Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati",
      "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama",
      "Mariga", "Mashegu", "Mokwa", "Muya", "Pailoro", "Rijau", "Shiroro",
      "Suleja", "Tafa", "Wushishi"
    ]),
  },
  {
    value: "ogun",
    label: "Ogun",
    lgas: createLgas([
      "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North",
      "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East",
      "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda",
      "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"
    ]),
  },
  {
    value: "ondo",
    label: "Ondo",
    lgas: createLgas([
      "Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West",
      "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje",
      "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West",
      "Ose", "Owo"
    ]),
  },
  {
    value: "osun",
    label: "Osun",
    lgas: createLgas([
      "Aiyedaade", "Aiyedire", "Atakumosa East", "Atakumosa West", "Boluwaduro",
      "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central",
      "Ife East", "Ife North", "Ife South", "Ifelodun", "Ila", "Ilesa East",
      "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin",
      "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"
    ]),
  },
  {
    value: "oyo",
    label: "Oyo",
    lgas: createLgas([
      "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East",
      "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central",
      "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju",
      "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa",
      "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West",
      "Saki East", "Saki West", "Surulere"
    ]),
  },
  {
    value: "plateau",
    label: "Plateau",
    lgas: createLgas([
      "Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South",
      "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang",
      "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"
    ]),
  },
  {
    value: "rivers",
    label: "Rivers",
    lgas: createLgas([
      "Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni",
      "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana",
      "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika",
      "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"
    ]),
  },
  {
    value: "sokoto",
    label: "Sokoto",
    lgas: createLgas([
      "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa",
      "Illela", "Isa", "Kware", "Kebbe", "Rabah", "Sabon Birni", "Shagari",
      "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta",
      "Wamako", "Wurno", "Yabo"
    ]),
  },
  {
    value: "taraba",
    label: "Taraba",
    lgas: createLgas([
      "Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo",
      "Karim Lamido", "Kaufan", "Lau", "Sardauna", "Takum", "Ussa", "Wukari",
      "Yorro", "Zing"
    ]),
  },
  {
    value: "yobe",
    label: "Yobe",
    lgas: createLgas([
      "Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gogaram",
      "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru",
      "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"
    ]),
  },
  {
    value: "zamfara",
    label: "Zamfara",
    lgas: createLgas([
      "Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi",
      "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara",
      "Zurmi"
    ]),
  },
];
