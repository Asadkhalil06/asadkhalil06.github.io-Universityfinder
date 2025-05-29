// Add Gmail API configuration at the top
const GMAIL_CONFIG = {
  apiKey: 'AIzaSyDBAfal0TyznYnZOPOEjuvjeXiKXLaHOTk',
  clientId: '907370875987-2qc7665tvdqk69c1u3qm1b0vc5i3c7pv.apps.googleusercontent.com',
  scopes: 'https://www.googleapis.com/auth/gmail.send',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
};

// Load the Gmail API client
function loadGmailApi() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: GMAIL_CONFIG.apiKey,
        clientId: GMAIL_CONFIG.clientId,
        discoveryDocs: GMAIL_CONFIG.discoveryDocs,
        scope: GMAIL_CONFIG.scopes
      }).then(() => {
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  });
}

// Function to send email using Gmail API
async function sendGmailWithAttachment(emailData) {
  try {
    // Check if user is signed in
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await gapi.auth2.getAuthInstance().signIn();
    }

    const attachments = await Promise.all(
      Array.from(document.getElementById('attachmentInput').files)
        .map(file => readFileAsBase64(file))
    );

    const email = createEmailWithAttachments(emailData, attachments);

    await gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: createRawEmail(email)
      }
    });

    alert('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Failed to send email. Please try again.');
  }
}

// Helper function to read file as base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({
        filename: file.name,
        mimeType: file.type,
        content: base64
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Create email with attachments
function createEmailWithAttachments(emailData, attachments) {
  const boundary = 'boundary' + Math.random().toString(36);
  const mimeVersion = 'MIME-Version: 1.0\n';
  const contentType = 'Content-Type: multipart/mixed; boundary=' + boundary + '\n';

  let email = [
    'To: ' + emailData.to,
    'From: ' + emailData.from,
    'Subject: ' + emailData.subject,
    mimeVersion,
    contentType,
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailData.body,
    ''
  ];

  // Add attachments
  attachments.forEach(attachment => {
    email = email.concat([
      '--' + boundary,
      'Content-Type: ' + (attachment.mimeType || 'application/octet-stream'),
      'Content-Transfer-Encoding: base64',
      'Content-Disposition: attachment; filename=' + attachment.filename,
      '',
      attachment.content
    ]);
  });

  email.push('--' + boundary + '--');
  return email.join('\n');
}

// Convert email to base64url format
function createRawEmail(emailContent) {
  return btoa(emailContent)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Update the openEmailClient function
function openEmailClient(client, emailData) {
  const subject = encodeURIComponent(emailData.subject);
  const body = encodeURIComponent(emailData.body);

  switch (client) {
    case 'gmail':
      // Check if there are attachments
      if (emailData.attachments && emailData.attachments.length > 0) {
        // Load Gmail API and send with attachments
        loadGmailApi()
          .then(() => sendGmailWithAttachment(emailData))
          .catch(error => {
            console.error('Error loading Gmail API:', error);
            alert('Failed to load Gmail API. Please try again.');
          });
      } else {
        // No attachments, use simple Gmail compose URL
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emailData.to}&su=${subject}&body=${body}`, '_blank');
      }
      break;
    case 'outlook':
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      break;
    default:
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      break;
  }
}

document.documentElement.style.setProperty('--animate-duration', '0.5s');

// Country-specific configurations
const countryConfigs = {
  UK: {
    cities: [
      'Aberdeen', 'Aberystwyth', 'Aldershot', 'Ashford', 'Aylesbury', 'Banbury',
      'Bangor', 'Barnsley', 'Basildon', 'Basingstoke', 'Bath', 'Bedford',
      'Belfast', 'Birmingham', 'Blackburn', 'Blackpool', 'Bolton', 'Bournemouth',
      'Bradford', 'Brighton', 'Bristol', 'Burnley', 'Burton upon Trent', 'Bury',
      'Cambridge', 'Canterbury', 'Cardiff', 'Carlisle', 'Chatham', 'Chelmsford',
      'Cheltenham', 'Chester', 'Chesterfield', 'Chichester', 'Colchester',
      'Coventry', 'Crawley', 'Crewe', 'Croydon', 'Darlington', 'Derby',
      'Doncaster', 'Dover', 'Dudley', 'Dundee', 'Durham', 'Eastbourne',
      'Edinburgh', 'Exeter', 'Falkirk', 'Falmouth', 'Folkestone', 'Glasgow',
      'Gloucester', 'Guildford', 'Halifax', 'Harrogate', 'Hartlepool',
      'Hastings', 'Hatfield', 'Hemel Hempstead', 'Hereford', 'High Wycombe',
      'Huddersfield', 'Hull', 'Inverness', 'Ipswich', 'Keele', 'Kendal',
      'Kingston upon Thames', 'Lancaster', 'Leeds', 'Leicester', 'Lincoln',
      'Liverpool', 'London', 'Loughborough', 'Luton', 'Maidstone', 'Manchester',
      'Mansfield', 'Middlesbrough', 'Milton Keynes', 'Newcastle upon Tyne',
      'Newport', 'Northampton', 'Norwich', 'Nottingham', 'Oldham', 'Oxford',
      'Peterborough', 'Plymouth', 'Poole', 'Portsmouth', 'Preston', 'Reading',
      'Rochdale', 'Rochester', 'Rugby', 'Salford', 'Scarborough', 'Sheffield',
      'Shrewsbury', 'Slough', 'Southampton', 'Southend-on-Sea', 'St Albans',
      'St Andrews', 'Stafford', 'Staines', 'Stevenage', 'Stirling',
      'Stoke-on-Trent', 'Sunderland', 'Swansea', 'Swindon', 'Taunton',
      'Telford', 'Torquay', 'Truro', 'Tunbridge Wells', 'Wakefield',
      'Warrington', 'Warwick', 'Watford', 'West Bromwich', 'Wigan',
      'Winchester', 'Windsor', 'Wolverhampton', 'Worcester', 'Worthing',
      'Wrexham', 'Yeovil', 'York'
    ],
    currencySymbol: '£',
    sheetName: 'UK'
  },
  Australia: {
    cities: [
      'Adelaide', 'Albany', 'Albury', 'Alice Springs', 'Armidale', 'Ballarat',
      'Bathurst', 'Bendigo', 'Brisbane', 'Broken Hill', 'Broome', 'Bunbury',
      'Bundaberg', 'Busselton', 'Cairns', 'Canberra', 'Casino', 'Coffs Harbour',
      'Darwin', 'Devonport', 'Dubbo', 'Echuca', 'Emerald', 'Esperance',
      'Frankston', 'Fremantle', 'Geelong', 'Geraldton', 'Gladstone', 'Gold Coast',
      'Goulburn', 'Grafton', 'Griffith', 'Hervey Bay', 'Hobart', 'Horsham',
      'Kalgoorlie', 'Karratha', 'Katherine', 'Kwinana', 'Launceston', 'Lismore',
      'Lithgow', 'Mackay', 'Maitland', 'Mandurah', 'Melbourne', 'Mildura',
      'Mount Gambier', 'Mount Isa', 'Newcastle', 'Nowra', 'Orange',
      'Palm Beach', 'Parramatta', 'Penrith', 'Perth', 'Port Augusta',
      'Port Hedland', 'Port Lincoln', 'Port Macquarie', 'Port Pirie',
      'Queanbeyan', 'Rockhampton', 'Shepparton', 'Sunshine Coast', 'Sydney',
      'Tamworth', 'Toowoomba', 'Townsville', 'Traralgon', 'Tweed Heads',
      'Wagga Wagga', 'Warrnambool', 'Whyalla', 'Wollongong', 'Wonthaggi',
      'Wyong'
    ],
    currencySymbol: 'A$',
    sheetName: 'Australia'
  },
  'New Zealand': {
    cities: [
      'Alexandra', 'Ashburton', 'Auckland', 'Blenheim', 'Cambridge', 'Christchurch',
      'Dunedin', 'Feilding', 'Gisborne', 'Gore', 'Hamilton', 'Hastings',
      'Hawera', 'Huntly', 'Invercargill', 'Kaikohe', 'Kaikoura', 'Kaitaia',
      'Kapiti', 'Kerikeri', 'Levin', 'Lower Hutt', 'Manukau', 'Masterton',
      'Matamata', 'Morrinsville', 'Napier', 'Nelson', 'New Plymouth',
      'Oamaru', 'Orewa', 'Palmerston North', 'Papakura', 'Paraparaumu',
      'Porirua', 'Pukekohe', 'Queenstown', 'Rangiora', 'Rotorua', 'Taupo',
      'Tauranga', 'Te Awamutu', 'Thames', 'Timaru', 'Tokoroa', 'Upper Hutt',
      'Wanaka', 'Wanganui', 'Wellington', 'Westport', 'Whakatane',
      'Whanganui', 'Whangarei'
    ],
    currencySymbol: 'NZ$',
    sheetName: 'New Zealand'
  },
  France: {
    cities: [
      'Aix-en-Provence', 'Ajaccio', 'Amiens', 'Angers', 'Angoulême', 'Annecy',
      'Antibes', 'Antony', 'Argenteuil', 'Arles', 'Asnières-sur-Seine', 'Aubervilliers',
      'Aulnay-sous-Bois', 'Avignon', 'Bayonne', 'Beauvais', 'Belfort', 'Besançon',
      'Béziers', 'Bordeaux', 'Boulogne-Billancourt', 'Bourg-en-Bresse', 'Bourges',
      'Brest', 'Caen', 'Calais', 'Cannes', 'Cergy', 'Chambéry', 'Champigny-sur-Marne',
      'Charleville-Mézières', 'Châteauroux', 'Chelles', 'Cholet', 'Clermont-Ferrand',
      'Colmar', 'Colombes', 'Courbevoie', 'Créteil', 'Dijon', 'Douai', 'Drancy',
      'Dunkerque', 'Évry', 'Fontenay-sous-Bois', 'Grenoble', 'Issy-les-Moulineaux',
      'Ivry-sur-Seine', 'La Rochelle', 'La Roche-sur-Yon', 'Le Havre', 'Le Mans',
      'Levallois-Perret', 'Lille', 'Limoges', 'Lorient', 'Lyon', 'Marseille',
      'Metz', 'Montauban', 'Montpellier', 'Montreuil', 'Mulhouse', 'Nancy',
      'Nanterre', 'Nantes', 'Narbonne', 'Nice', 'Nîmes', 'Niort', 'Orléans',
      'Paris', 'Pau', 'Perpignan', 'Poitiers', 'Quimper', 'Reims', 'Rennes',
      'Rouen', 'Saint-Denis', 'Saint-Étienne', 'Saint-Maur-des-Fossés',
      'Saint-Nazaire', 'Saint-Paul', 'Saint-Pierre', 'Saint-Quentin', 'Strasbourg',
      'Toulon', 'Toulouse', 'Tours', 'Troyes', 'Valence', 'Valenciennes',
      'Vannes', 'Versailles', 'Vienne', 'Villeurbanne', 'Vitry-sur-Seine'
    ],
    currencySymbol: '€',
    sheetName: 'France'
  },
  Finland: {
    cities: [
      'Espoo', 'Forssa', 'Hamina', 'Hanko', 'Heinola', 'Helsinki', 'Hyvinkää',
      'Hämeenlinna', 'Iisalmi', 'Imatra', 'Jakobstad', 'Joensuu', 'Jyväskylä',
      'Järvenpää', 'Kaarina', 'Kajaani', 'Kankaanpää', 'Karkkila', 'Kaskinen',
      'Kauhava', 'Kauniainen', 'Kemi', 'Kemijärvi', 'Kerava', 'Kirkkonummi',
      'Kitee', 'Kiuruvesi', 'Kokemäki', 'Kokkola', 'Kotka', 'Kouvola',
      'Kristiinankaupunki', 'Kuhmo', 'Kuopio', 'Kurikka', 'Kuusamo',
      'Lahti', 'Laitila', 'Lappeenranta', 'Lapua', 'Lieksa', 'Lohja',
      'Loimaa', 'Loviisa', 'Maarianhamina', 'Mikkeli', 'Mänttä-Vilppula',
      'Naantali', 'Nokia', 'Nurmes', 'Nurmijärvi', 'Orimattila', 'Oulu',
      'Outokumpu', 'Paimio', 'Parainen', 'Pieksämäki', 'Pietarsaari',
      'Pori', 'Porvoo', 'Raahe', 'Raasepori', 'Raisio', 'Rauma',
      'Riihimäki', 'Rovaniemi', 'Saarijärvi', 'Salo', 'Sastamala',
      'Savonlinna', 'Seinäjoki', 'Siilinjärvi', 'Sipoo', 'Somero',
      'Tampere', 'Tornio', 'Turku', 'Tuusula', 'Ulvila', 'Uusikaupunki',
      'Vaasa', 'Valkeakoski', 'Vantaa', 'Varkaus', 'Viitasaari',
      'Vilppula', 'Virrat', 'Ylivieska', 'Ylöjärvi', 'Äänekoski'
    ],
    currencySymbol: '€',
    sheetName: 'Finland'
  },
  Hungary: {
    cities: [
      'Ajka', 'Baja', 'Balassagyarmat', 'Balatonfüred', 'Békés', 'Békéscsaba',
      'Berettyóújfalu', 'Bonyhád', 'Budapest', 'Cegléd', 'Celldömölk',
      'Csorna', 'Debrecen', 'Dombóvár', 'Dunakeszi', 'Dunaújváros', 'Eger',
      'Érd', 'Esztergom', 'Fehérgyarmat', 'Gödöllő', 'Gyöngyös', 'Győr',
      'Gyula', 'Hajdúböszörmény', 'Hajdúnánás', 'Hajdúszoboszló', 'Hatvan',
      'Hódmezővásárhely', 'Jászberény', 'Kalocsa', 'Kaposvár', 'Karcag',
      'Kazincbarcika', 'Kecskemét', 'Keszthely', 'Kiskunfélegyháza',
      'Kiskunhalas', 'Kisvárda', 'Komárom', 'Komló', 'Körmend', 'Kőszeg',
      'Makó', 'Marcali', 'Mezőkövesd', 'Mezőtúr', 'Miskolc', 'Mohács',
      'Monor', 'Mosonmagyaróvár', 'Nagykanizsa', 'Nagykőrös', 'Nyíregyháza',
      'Orosháza', 'Ózd', 'Paks', 'Pápa', 'Pécs', 'Salgótarján', 'Sárbogárd',
      'Sárospatak', 'Sárvár', 'Sátoraljaújhely', 'Siófok', 'Sopron',
      'Szarvas', 'Szeged', 'Székesfehérvár', 'Szekszárd', 'Szentendre',
      'Szentes', 'Szigetszentmiklós', 'Szolnok', 'Szombathely', 'Tata',
      'Tatabánya', 'Törökszentmiklós', 'Vác', 'Várpalota', 'Veszprém',
      'Zalaegerszeg', 'Zalaszentgrót'
    ],
    currencySymbol: 'Ft',
    sheetName: 'Hungary'
  },
  Cyprus: {
    cities: [
      'Agia Napa', 'Agios Athanasios', 'Agios Dometios', 'Agios Nikolaos',
      'Aglandjia', 'Akaki', 'Alethriko', 'Aradippou', 'Aradhippou', 'Athienou',
      'Dali', 'Dasoupolis', 'Deftera', 'Deryneia', 'Dhali', 'Dromolaxia',
      'Egkomi', 'Emba', 'Engomi', 'Episkopi', 'Famagusta', 'Germasogeia',
      'Geroskipou', 'Geri', 'Ipsonas', 'Kaimakli', 'Kakopetria', 'Kiti',
      'Kokkinotrimithia', 'Kyrenia', 'Lakatamia', 'Lapithos', 'Larnaca',
      'Latsia', 'Lefkara', 'Limassol', 'Livadia', 'Mammari', 'Mesa Geitonia',
      'Morphou', 'Nicosia', 'Oroklini', 'Pachna', 'Palaiometocho', 'Paphos',
      'Paralimni', 'Peyia', 'Polis', 'Protaras', 'Psimolofou', 'Sotira',
      'Strovolos', 'Tseri', 'Xylofagou', 'Xylotymvou', 'Ypsonas'
    ],
    currencySymbol: '€',
    sheetName: 'Cyprus'
  },
  Austria: {
    cities: [
      'Amstetten', 'Ansfelden', 'Baden', 'Bad Ischl', 'Bludenz', 'Braunau am Inn',
      'Bregenz', 'Dornbirn', 'Eisenstadt', 'Feldkirch', 'Feldkirchen',
      'Gänserndorf', 'Gmunden', 'Graz', 'Hallein', 'Hard', 'Hohenems',
      'Innsbruck', 'Kapfenberg', 'Klagenfurt', 'Klosterneuburg', 'Korneuburg',
      'Krems', 'Kufstein', 'Lauterach', 'Leonding', 'Leoben', 'Linz',
      'Lustenau', 'Mödling', 'Perchtoldsdorf', 'Pinkafeld', 'Pöchlarn',
      'Poysdorf', 'Rankweil', 'Ried im Innkreis', 'Röthis', 'Rust', 'Saalfelden',
      'Salzburg', 'Sankt Pölten', 'Schwaz', 'Schwechat', 'Spittal an der Drau',
      'Steyr', 'Stockerau', 'Telfs', 'Ternitz', 'Traiskirchen', 'Traun',
      'Vienna', 'Villach', 'Vöcklabruck', 'Waidhofen', 'Weiz', 'Wels',
      'Wiener Neustadt', 'Wolfsberg', 'Wörgl', 'Zeltweg', 'Zwettl'
    ],
    currencySymbol: '€',
    sheetName: 'Austria'
  },
  Ireland: {
    cities: [
      'Arklow', 'Athlone', 'Athy', 'Balbriggan', 'Ballina', 'Ballinasloe',
      'Ballybay', 'Ballyshannon', 'Bandon', 'Bantry', 'Belturbet', 'Birr',
      'Bray', 'Bundoran', 'Carlow', 'Carrick-on-Shannon', 'Carrick-on-Suir',
      'Cashel', 'Castlebar', 'Cavan', 'Celbridge', 'Clonmel', 'Cobh', 'Cork',
      'Drogheda', 'Dublin', 'Dundalk', 'Dungarvan', 'Ennis', 'Enniscorthy',
      'Fermoy', 'Galway', 'Gorey', 'Greystones', 'Kilkenny', 'Killarney',
      'Killorglin', 'Kilrush', 'Kinsale', 'Leixlip', 'Letterkenny', 'Limerick',
      'Lismore', 'Listowel', 'Longford', 'Loughrea', 'Macroom', 'Mallow',
      'Maynooth', 'Midleton', 'Monaghan', 'Mullingar', 'Naas', 'Navan',
      'Nenagh', 'New Ross', 'Newbridge', 'Portlaoise', 'Roscommon', 'Shannon',
      'Skerries', 'Skibbereen', 'Sligo', 'Swords', 'Templemore', 'Thurles',
      'Tipperary', 'Tralee', 'Trim', 'Tuam', 'Tullamore', 'Waterford',
      'Westport', 'Wexford', 'Wicklow', 'Youghal'
    ],
    currencySymbol: '€',
    sheetName: 'Ireland'
  },
  'South Korea': {
    cities: [
      'Andong', 'Ansan', 'Anseong', 'Anyang', 'Asan', 'Boryeong', 'Bucheon',
      'Busan', 'Changwon', 'Cheonan', 'Cheongju', 'Chuncheon', 'Daegu',
      'Daejeon', 'Dangjin', 'Dongducheon', 'Donghae', 'Gangneung', 'Geoje',
      'Gimcheon', 'Gimhae', 'Gimje', 'Gimpo', 'Gongju', 'Goyang', 'Gumi',
      'Gunpo', 'Gunsan', 'Guri', 'Gwacheon', 'Gwangju', 'Gwangmyeong',
      'Gwangyang', 'Gyeongju', 'Gyeongsan', 'Hanam', 'Hwado', 'Hwaseong',
      'Icheon', 'Iksan', 'Incheon', 'Jecheon', 'Jeju', 'Jeongeup', 'Jeonju',
      'Jinju', 'Mokpo', 'Namyangju', 'Naju', 'Namwon', 'Nonsan', 'Osan',
      'Paju', 'Pocheon', 'Pohang', 'Pyeongtaek', 'Sacheon', 'Sangju', 'Sejong',
      'Seogwipo', 'Seongnam', 'Seoul', 'Siheung', 'Suncheon', 'Suwon', 'Taebaek',
      'Tongyeong', 'Uijeongbu', 'Uiwang', 'Ulsan', 'Wonju', 'Yangju', 'Yangsan',
      'Yeoju', 'Yeosu', 'Yongin'
    ],
    currencySymbol: '₩',
    sheetName: 'South Korea'
  },
  Japan: {
    cities: [
      'Abiko', 'Ageo', 'Akita', 'Amagasaki', 'Anjo', 'Aomori', 'Asahikawa',
      'Atsugi', 'Beppu', 'Chiba', 'Chofu', 'Dazaifu', 'Ebetsu', 'Ebina',
      'Fuchu', 'Fujisawa', 'Fukui', 'Fukuoka', 'Fukushima', 'Fussa',
      'Gifu', 'Habikino', 'Hachioji', 'Hakodate', 'Hamamatsu', 'Himeji',
      'Hiroshima', 'Hitachi', 'Ichikawa', 'Ichinomiya', 'Iizuka', 'Ina',
      'Inazawa', 'Isehara', 'Ishigaki', 'Iwaki', 'Iwakuni', 'Iwata',
      'Izumo', 'Joetsu', 'Kadoma', 'Kagoshima', 'Kakogawa', 'Kamakura',
      'Kanazawa', 'Kashiwa', 'Kawagoe', 'Kawaguchi', 'Kawasaki', 'Kitakyushu',
      'Kobe', 'Kochi', 'Kodaira', 'Kofu', 'Komaki', 'Komatsu', 'Koriyama',
      'Koshigaya', 'Kumagaya', 'Kumamoto', 'Kurashiki', 'Kurume', 'Kyoto',
      'Machida', 'Maebashi', 'Matsudo', 'Matsue', 'Matsumoto', 'Matsusaka',
      'Matsuyama', 'Mihara', 'Mishima', 'Mito', 'Miyazaki', 'Morioka',
      'Nagano', 'Nagaoka', 'Nagasaki', 'Nagoya', 'Naha', 'Nara', 'Narashino',
      'Narita', 'Niigata', 'Nishinomiya', 'Nishio', 'Nobeoka', 'Numazu',
      'Obihiro', 'Odawara', 'Oita', 'Okayama', 'Okazaki', 'Omiya', 'Omuta',
      'Osaka', 'Otaru', 'Otsu', 'Saga', 'Sagamihara', 'Saitama', 'Sakai',
      'Sakura', 'Sapporo', 'Sasebo', 'Sendai', 'Shimonoseki', 'Shizuoka',
      'Takamatsu', 'Takasaki', 'Takatsuki', 'Tokyo', 'Tottori', 'Toyama',
      'Toyohashi', 'Toyonaka', 'Tsu', 'Tsukuba', 'Ueda', 'Uji', 'Utsunomiya',
      'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamato', 'Yao', 'Yokkaichi',
      'Yokohama', 'Yokosuka'
    ],
    currencySymbol: '¥',
    sheetName: 'Japan'
  },
  Turkey: {
    cities: [
      'Adana', 'Adapazari', 'Adiyaman', 'Afyonkarahisar', 'Agri', 'Aksaray',
      'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydin', 'Balikesir',
      'Bartin', 'Batman', 'Bayburt', 'Bilecik', 'Bingol', 'Bitlis', 'Bolu',
      'Burdur', 'Bursa', 'Canakkale', 'Cankiri', 'Corum', 'Denizli',
      'Diyarbakir', 'Duzce', 'Edirne', 'Elazig', 'Erzincan', 'Erzurum',
      'Eskisehir', 'Gaziantep', 'Giresun', 'Gumushane', 'Hakkari', 'Hatay',
      'Igdir', 'Isparta', 'Istanbul', 'Izmir', 'Kahramanmaras', 'Karabuk',
      'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kirikkale',
      'Kirklareli', 'Kirsehir', 'Kocaeli', 'Konya', 'Kutahya', 'Malatya',
      'Manisa', 'Mardin', 'Mersin', 'Mugla', 'Mus', 'Nevsehir', 'Nigde',
      'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Sanliurfa', 'Siirt',
      'Sinop', 'Sirnak', 'Sivas', 'Tekirdag', 'Tokat', 'Trabzon', 'Tunceli',
      'Usak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
    ],
    currencySymbol: '₺',
    sheetName: 'Turkey'
  },
  China: {
    cities: [
      'Anqing', 'Anshan', 'Baoding', 'Baotou', 'Beijing', 'Bengbu', 'Benxi',
      'Cangzhou', 'Changchun', 'Changde', 'Changsha', 'Changzhou', 'Chengdu',
      'Chifeng', 'Chongqing', 'Dalian', 'Dandong', 'Datong', 'Dongguan',
      'Foshan', 'Fushun', 'Fuxin', 'Fuzhou', 'Guangzhou', 'Guilin', 'Guiyang',
      'Haikou', 'Handan', 'Hangzhou', 'Harbin', 'Hefei', 'Hengyang', 'Hohhot',
      'Huaibei', 'Huainan', 'Huangshi', 'Huizhou', 'Jiamusi', 'Jiangmen',
      'Jiaxing', 'Jilin', 'Jinan', 'Jingdezhen', 'Jinhua', 'Jining',
      'Jinzhou', 'Jixi', 'Kaifeng', 'Kunming', 'Lanzhou', 'Lianyungang',
      'Liaocheng', 'Liaoyang', 'Linyi', 'Liuzhou', 'Luoyang', 'Nanchang',
      'Nanjing', 'Nanning', 'Nantong', 'Nanyang', 'Ningbo', 'Panjin',
      'Qingdao', 'Qinhuangdao', 'Quanzhou', 'Rizhao', 'Shanghai', 'Shantou',
      'Shaoxing', 'Shenyang', 'Shenzhen', 'Shijiazhuang', 'Suzhou', 'Taian',
      'Taiyuan', 'Tangshan', 'Tianjin', 'Urumqi', 'Weifang', 'Weihai',
      'Wenzhou', 'Wuhan', 'Wuhu', 'Wuxi', 'Xiamen', 'Xi\'an', 'Xiangtan',
      'Xingtai', 'Xining', 'Xuzhou', 'Yancheng', 'Yangzhou', 'Yantai',
      'Yichang', 'Yinchuan', 'Yingkou', 'Zaozhuang', 'Zhangjiakou',
      'Zhangzhou', 'Zhanjiang', 'Zhengzhou', 'Zhenjiang', 'Zhuhai', 'Zibo'
    ],
    currencySymbol: '¥',
    sheetName: 'China'
  },
  Canada: {
    cities: [
      'Abbotsford', 'Ajax', 'Barrie', 'Belleville', 'Brampton', 'Brandon',
      'Brantford', 'Brockville', 'Burlington', 'Burnaby', 'Calgary',
      'Cambridge', 'Charlottetown', 'Chatham-Kent', 'Chilliwack', 'Cornwall',
      'Dartmouth', 'Delta', 'Drummondville', 'Edmonton', 'Fredericton',
      'Gatineau', 'Guelph', 'Halifax', 'Hamilton', 'Kamloops', 'Kelowna',
      'Kingston', 'Kitchener', 'Langley', 'Laval', 'Lethbridge', 'London',
      'Longueuil', 'Medicine Hat', 'Mississauga', 'Moncton', 'Montreal',
      'Nanaimo', 'New Westminster', 'Niagara Falls', 'North Bay', 'North Vancouver',
      'Oakville', 'Oshawa', 'Ottawa', 'Peterborough', 'Pickering',
      'Port Alberni', 'Port Coquitlam', 'Prince Albert', 'Prince George',
      'Quebec City', 'Red Deer', 'Regina', 'Richmond', 'Richmond Hill',
      'Saint John', 'St. Catharines', 'St. John\'s', 'Saint-Jerome',
      'Saint-Jean-sur-Richelieu', 'Saskatoon', 'Sault Ste. Marie',
      'Sherbrooke', 'Surrey', 'Sydney', 'Thunder Bay', 'Toronto',
      'Trois-Rivieres', 'Vancouver', 'Vaughan', 'Victoria', 'Waterloo',
      'West Vancouver', 'White Rock', 'Windsor', 'Winnipeg', 'Yellowknife'
    ],
    currencySymbol: 'C$',
    sheetName: 'Canada'
  },
  USA: {
    cities: [
      'Albuquerque', 'Anaheim', 'Anchorage', 'Ann Arbor', 'Arlington',
      'Atlanta', 'Austin', 'Baltimore', 'Baton Rouge', 'Berkeley', 'Birmingham',
      'Boise', 'Boston', 'Boulder', 'Buffalo', 'Burlington', 'Cambridge',
      'Charleston', 'Charlotte', 'Chicago', 'Cincinnati', 'Cleveland',
      'Colorado Springs', 'Columbia', 'Columbus', 'Dallas', 'Dayton',
      'Denver', 'Des Moines', 'Detroit', 'Durham', 'El Paso', 'Eugene',
      'Fort Collins', 'Fort Lauderdale', 'Fort Worth', 'Fresno', 'Gainesville',
      'Grand Rapids', 'Hartford', 'Honolulu', 'Houston', 'Indianapolis',
      'Irvine', 'Jacksonville', 'Kansas City', 'Las Vegas', 'Lexington',
      'Lincoln', 'Little Rock', 'Long Beach', 'Los Angeles', 'Louisville',
      'Madison', 'Memphis', 'Miami', 'Milwaukee', 'Minneapolis', 'Nashville',
      'New Haven', 'New Orleans', 'New York', 'Newark', 'Oakland', 'Oklahoma City',
      'Omaha', 'Orlando', 'Philadelphia', 'Phoenix', 'Pittsburgh', 'Portland',
      'Providence', 'Raleigh', 'Reno', 'Richmond', 'Rochester', 'Sacramento',
      'Salt Lake City', 'San Antonio', 'San Diego', 'San Francisco', 'San Jose',
      'Santa Barbara', 'Santa Fe', 'Seattle', 'St. Louis', 'St. Paul',
      'Syracuse', 'Tampa', 'Tempe', 'Tucson', 'Tulsa', 'Virginia Beach',
      'Washington DC', 'Wichita'
    ],
    currencySymbol: '$',
    sheetName: 'USA'
  }
};

// Global variable for current country
let currentCountry = 'UK';

document.addEventListener('DOMContentLoaded', function () {
  // Configuration
  const config = {
    spreadsheetId: '1UqQev32I997yJ7BVYjCf-VKt2NUS7mat1n0LZn_G6bI',
    apiKey: 'AIzaSyA03sD9ydP_SbJdntHVND5Htb4PkqQDx_c',
    sheetName: 'UK', // Default sheet
    range: 'A1:K1000' // Expanded range to include more rows and the Program_Name column
  };

  const fieldsOfStudy = ['Computer Science', 'Business Administration', 'Engineering',
    'Medicine', 'Law', 'Arts', 'Psychology', 'Economics',
    'Architecture', 'Education', 'Biology', 'Chemistry'];

  // Initialize the page
  populateDropdowns(currentCountry);
  testConnection();

  // Handle country change
  document.getElementById('country').addEventListener('change', async function (e) {
    currentCountry = e.target.value;
    config.sheetName = countryConfigs[currentCountry].sheetName;
    populateDropdowns(currentCountry);
    updateCurrencyLabels(currentCountry);
    await populateUniversityDropdown(currentCountry);
    // Clear previous results and dropdowns
    document.querySelector('#resultsTable tbody').innerHTML = '';
    document.getElementById('course').innerHTML = '<option value="">Select Course</option>';
  });

  // Populate dropdowns
  function populateDropdowns(country) {
    setupLocationDropdown(country);
    setupFieldCheckboxes();
    updateFeeRangeOptions(country);
  }

  function setupLocationDropdown(country) {
    const locationContainer = document.querySelector('.checkbox-options');
    const selectBox = document.getElementById('locationSelectBox');
    const checkboxList = document.getElementById('locationCheckboxes');
    const selectedText = selectBox.querySelector('.selected-text');
    const searchInput = document.getElementById('locationSearch');

    // Clear existing checkboxes and event listeners
    locationContainer.innerHTML = '';
    const oldSelectBox = document.getElementById('locationSelectBox');
    const newSelectBox = oldSelectBox.cloneNode(true);
    oldSelectBox.parentNode.replaceChild(newSelectBox, oldSelectBox);

    // Get available locations based on university and course selection
    const availableLocations = getAvailableLocations(country);

    // Add locations as checkboxes
    availableLocations.forEach(city => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" name="location" value="${city}"> ${city}`;
      locationContainer.appendChild(label);
    });

    // Re-initialize event listeners
    initializeDropdownListeners(newSelectBox, checkboxList, searchInput, locationContainer, selectedText);
  }

  function getAvailableLocations(country) {
    const selectedUniversity = document.getElementById('university').value;
    const selectedCourse = document.getElementById('course').value;

    // If no university or course is selected, return all cities for the country
    if (!selectedUniversity || !selectedCourse) {
      return countryConfigs[country].cities;
    }

    // Filter locations based on selected university and course
    const filteredLocations = new Set();
    const data = universityData.filter(uni =>
      uni.University_Name === selectedUniversity &&
      uni.Course === selectedCourse
    );

    data.forEach(uni => {
      const locations = uni.Location.split(/,\s*/).map(loc => loc.trim());
      locations.forEach(loc => filteredLocations.add(loc));
    });

    return Array.from(filteredLocations).sort();
  }

  function initializeDropdownListeners(selectBox, checkboxList, searchInput, locationContainer, selectedText) {
    // Toggle dropdown
    selectBox.addEventListener('click', function (e) {
      e.stopPropagation();
      const isActive = checkboxList.classList.contains('show');
      checkboxList.classList.toggle('show');
      selectBox.classList.toggle('active');

      if (!isActive) {
        searchInput.focus();
      }
    });

    // Handle search
    searchInput.addEventListener('input', function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const labels = locationContainer.querySelectorAll('label');

      labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!selectBox.contains(e.target) && !checkboxList.contains(e.target)) {
        checkboxList.classList.remove('show');
        selectBox.classList.remove('active');
      }
    });

    // Handle checkbox changes
    const checkboxes = locationContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        updateSelectedLocations(checkboxes, selectedText);
      });
    });
  }

  function updateSelectedLocations(checkboxes, selectedText) {
    const selectedLocations = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedLocations.length === 0) {
      selectedText.textContent = 'Select Locations';
    } else if (selectedLocations.length <= 2) {
      selectedText.textContent = selectedLocations.join(', ');
    } else {
      selectedText.textContent = `${selectedLocations.length} locations selected`;
    }
  }

  function setupFieldCheckboxes() {
    const fieldContainer = document.getElementById('fieldCheckboxes');
    fieldContainer.innerHTML = ''; // Clear existing checkboxes
    fieldsOfStudy.forEach(field => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" name="field" value="${field}"> ${field}`;
      fieldContainer.appendChild(label);
    });
  }

  function updateFeeRangeOptions(country) {
    const feeSelect = document.getElementById('fee');
    const symbol = countryConfigs[country].currencySymbol;
    feeSelect.innerHTML = `
      <option value="">Select Range</option>
      <option value="5000-10000">${symbol}5,000-${symbol}10,000</option>
      <option value="10000-15000">${symbol}10,000-${symbol}15,000</option>
      <option value="15000-20000">${symbol}15,000-${symbol}20,000</option>
      <option value="20000-25000">${symbol}20,000-${symbol}25,000</option>
      <option value="25000-30000">${symbol}25,000-${symbol}30,000</option>
      <option value="30000+">${symbol}30,000+</option>
    `;
  }

  function updateCurrencyLabels(country) {
    const symbol = countryConfigs[country].currencySymbol;
    document.querySelector('label[for="fee"]').textContent = `Fee Range (${symbol}):`;
  }

  // Update formatCurrency function to handle different currencies
  function formatCurrency(value, country = currentCountry) {
    if (!value) return 'N/A';
    const symbol = countryConfigs[country].currencySymbol;
    const num = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(num) ? value : symbol + num.toLocaleString('en-GB');
  }

  // Test the connection on load
  async function testConnection() {
    try {
      const data = await fetchDataFromGoogleSheets(config);
      if (data && data.length > 0) {
        console.log('Test data received:', data.slice(0, 5));
        displayFilteredResults(data.slice(0, 5), {}); // Pass empty filters for initial display
      } else {
        console.error('Data loaded but empty');
        displayError(new Error('Data loaded but empty'));
      }
    } catch (error) {
      console.error('Test connection error:', error);
      displayError(error);
    }
  }

  // Fetch data from Google Sheets by using google API via Google cloud console
  async function fetchDataFromGoogleSheets({ spreadsheetId, apiKey, sheetName, range }) {
    console.log('Fetching data from sheet:', sheetName);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?key=${apiKey}`;

    try {
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw data received:', data);

      if (!data.values) {
        console.error('No values in response:', data);
        throw new Error('No data values in response');
      }

      if (data.values.length === 0) {
        console.error('Empty values array in response');
        throw new Error('No data found in the sheet');
      }

      // Transform the data into an array of objects
      const headers = data.values[0].map(header =>
        header.trim()
          .replace(/ /g, '_')
          .replace(/[()]/g, '')
      );
      console.log('Processed headers:', headers);

      const processedData = data.values.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = (row[i] || '').trim() || 'N/A';
        });
        return obj;
      });

      console.log('Processed data sample:', processedData.slice(0, 2));
      return processedData;

    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  // Display results in the table
  function displayFilteredResults(universities, activeFilters) {
    console.log('Displaying filtered results:', universities);
    console.log('Active filters:', activeFilters);

    const tableBody = document.querySelector('#resultsTable tbody');
    if (!tableBody) {
      console.error('Table body element not found');
      return;
    }

    tableBody.innerHTML = '';

    if (!universities || universities.length === 0) {
      console.log('No universities to display');
      tableBody.innerHTML = `
        <tr>
          <td colspan="13" class="no-results">
            <div class="no-results-content">
              <h3>No universities match your selection</h3>
              <p>Try adjusting your filters:</p>
              <ul>
                ${activeFilters.locations?.length ? '<li>Choose different locations</li>' : ''}
                ${activeFilters.englishTests?.length ? '<li>Select different English tests</li>' : ''}
                ${activeFilters.cgpa ? '<li>Widen your score range</li>' : ''}
                ${activeFilters.fields?.length ? '<li>Choose different fields of study</li>' : ''}
                ${activeFilters.fee ? '<li>Adjust your fee range</li>' : ''}
              </ul>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    try {
      universities.forEach((uni, index) => {
        console.log(`Processing university ${index + 1}:`, uni);
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        row.classList.add('animate__animated', 'animate__fadeInUp');

        // Ensure all required fields are present
        const safeUni = {
          University_Name: uni.University_Name || 'N/A',
          Location: uni.Location || 'N/A',
          Degree: uni.Degree || 'N/A',
          Course: uni.Course || 'N/A',
          Intake: uni.Intake || 'N/A',
          Percentage_CGPA: uni.Percentage_CGPA || 'N/A',
          English_Test: uni.English_Test || 'N/A',
          Study_Gap: uni.Study_Gap || 'N/A',
          Field_of_Study: uni.Field_of_Study || 'N/A',
          Fee: uni.Fee || 'N/A',
          Initial_Deposit: uni.Initial_Deposit || 'N/A',
          Other_Remarks: uni.Other_Remarks || 'N/A',
          Course_link: uni.Course_link || 'N/A'
        };

        row.innerHTML = `
          <td>${escapeHtml(safeUni.University_Name)}</td>
          <td>${escapeHtml(safeUni.Location)}</td>
          <td>${escapeHtml(safeUni.Degree)}</td>
          <td>${escapeHtml(safeUni.Course)}</td>
          <td>${escapeHtml(safeUni.Intake)}</td>
          <td>${formatScore(safeUni.Percentage_CGPA, activeFilters.cgpa)}</td>
          <td>${formatListItems(safeUni.English_Test, activeFilters.englishTests, /,\s*|\/|and|or/)}</td>
          <td>${escapeHtml(safeUni.Study_Gap)}</td>
          <td>${formatListItems(safeUni.Field_of_Study, activeFilters.fields)}</td>
          <td>${formatCurrency(safeUni.Fee)}</td>
          <td>${formatCurrency(safeUni.Initial_Deposit)}</td>
          <td>${escapeHtml(safeUni.Other_Remarks)}</td>
          <td>${safeUni.Course_link !== 'N/A' ?
            `<a href="${escapeHtml(safeUni.Course_link)}" target="_blank">View Course</a>` :
            'N/A'}</td>
        `;

        tableBody.appendChild(row);
      });

      console.log('Finished displaying universities');
    } catch (error) {
      console.error('Error displaying results:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="13" style="text-align: center; color: red;">
            Error displaying results. Please try again.
          </td>
        </tr>
      `;
    }
  }


  // Helper functions
  function escapeHtml(text) {
    return text ? text.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'N/A';
  }

  function formatListItems(value, filterItems, separator = /,\s*/) {
    if (!value) return 'N/A';
    if (!filterItems || filterItems.length === 0) return escapeHtml(value);

    return value.split(separator)
      .map(item => {
        const isMatch = filterItems.some(f =>
          f.toLowerCase() === item.trim().toLowerCase()
        );
        return isMatch ?
          `<span class="filter-match">${escapeHtml(item.trim())}</span>` :
          escapeHtml(item.trim());
      })
      .join(', ');
  }

  function formatScore(value, rangeFilter) {
    if (!value) return 'N/A';

    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(numericValue)) return escapeHtml(value);

    let displayValue = value.includes('%') ?
      `${numericValue}%` :
      `${numericValue.toFixed(1)} CGPA`;

    if (rangeFilter) {
      const [min, max] = rangeFilter.split('-').map(parseFloat);
      if (numericValue >= min && numericValue <= max) {
        displayValue = `<span class="filter-match">${displayValue}</span>`;
      }
    }

    return displayValue;
  }

  // Display error message
  function displayError(error) {
    console.error('Error:', error);
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; color: red;">
                    
                    No data Available. Kindly select filter.
                </td>
            </tr>
        `;
  }

  // Form submission handler
  document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Searching...';

    try {
      const rawData = await fetchDataFromGoogleSheets(config);
      if (!rawData || rawData.length === 0) {
        throw new Error("No university data available");
      }

      const filters = {
        university: document.getElementById('university').value,
        course: document.getElementById('course').value,
        degree: document.getElementById('degree').value,
        englishTests: Array.from(document.querySelectorAll('input[name="englishTest"]:checked'))
          .map(el => el.value),
        locations: Array.from(document.querySelectorAll('input[name="location"]:checked'))
          .map(el => el.value),
        cgpa: document.getElementById('cgpa').value,
        fields: Array.from(document.querySelectorAll('input[name="field"]:checked'))
          .map(el => el.value),
        fee: document.getElementById('fee').value
      };

      console.log("Active filters:", filters);
      const filteredData = filterUniversities(rawData, filters);
      console.log(`Found ${filteredData.length} matching records`);
      displayFilteredResults(filteredData, filters);

    } catch (error) {
      console.error("Search error:", error);
      displayError(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Find Universities';
    }
  });

  // Filter universities
  function filterUniversities(data, criteria) {
    return data.filter(university => {
      // Location filter
      if (criteria.locations && criteria.locations.length > 0) {
        const uniLocations = university.Location.toLowerCase().split(/,\s*/).map(loc => loc.trim());
        if (!criteria.locations.some(loc => uniLocations.includes(loc.toLowerCase().trim()))) {
          return false;
        }
      }

      // Fee filter with exact matching
      if (criteria.fee && criteria.fee !== "") {
        const [minFee, maxFee] = criteria.fee.split('-').map(f =>
          f === '+' ? Infinity : parseInt(f.replace(/[^0-9]/g, ''))
        );
        const uniFee = parseInt(university.Fee.replace(/[^0-9]/g, ''));

        if (isNaN(uniFee) || uniFee < minFee || (maxFee !== Infinity && uniFee > maxFee)) {
          return false;
        }
      }

      // Keep other existing filter conditions
      if (criteria.university && criteria.university !== "") {
        if (university.University_Name !== criteria.university) return false;
      }

      if (criteria.course && criteria.course !== "") {
        if (university.Course !== criteria.course) return false;
      }

      if (criteria.degree && criteria.degree !== "") {
        if (!degreesMatch(university.Degree, criteria.degree)) return false;
      }

      return true;
    });
  }

  // Global variables to store university and course data
  let universityData = {};
  let currentUniversities = [];

  // Function to populate university dropdown based on country selection
  async function populateUniversityDropdown(country) {
    const universitySelect = document.getElementById('university');
    universitySelect.innerHTML = '<option value="">Select University/College</option>';

    try {
      const data = await fetchDataFromGoogleSheets({
        spreadsheetId: config.spreadsheetId,
        apiKey: config.apiKey,
        sheetName: countryConfigs[country].sheetName,
        range: config.range
      });

      // Get unique universities
      const universities = [...new Set(data.map(item => item.University_Name))].sort();
      currentUniversities = universities;
      universityData = data;

      // Add universities to dropdown
      universities.forEach(uni => {
        const option = document.createElement('option');
        option.value = uni;
        option.textContent = uni;
        universitySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error populating universities:', error);
    }
  }

  // Function to check if degrees match
  function degreesMatch(courseDegree, selectedDegree) {
    if (!courseDegree || !selectedDegree) return false;

    courseDegree = courseDegree.toLowerCase().trim();
    selectedDegree = selectedDegree.toLowerCase().trim();

    // Direct match
    if (courseDegree === selectedDegree) return true;

    // Handle Bachelor degree variations
    if (selectedDegree.includes('bachelor')) {
      const yearMatch = selectedDegree.match(/\((\d)\s*Years?\)/);
      if (yearMatch) {
        const years = yearMatch[1];
        return courseDegree.includes('bachelor') && courseDegree.includes(years + ' year');
      }
      return courseDegree.includes('bachelor');
    }

    // Handle Master degree variations
    if (selectedDegree.includes('master')) {
      const isTaught = selectedDegree.includes('taught');
      const isResearch = selectedDegree.includes('research');

      if (isTaught) {
        return courseDegree.includes('master') &&
          (courseDegree.includes('taught') || !courseDegree.includes('research'));
      }
      if (isResearch) {
        return courseDegree.includes('master') && courseDegree.includes('research');
      }
      return courseDegree.includes('master');
    }

    // Handle other degree types
    const degreeTypes = {
      'foundation year': ['foundation', 'foundation year'],
      'international year one/diploma': ['international year', 'year one', 'diploma', 'international diploma'],
      'top-up': ['top-up', 'top up'],
      'graduate certificate': ['graduate certificate', 'grad cert', 'graduate cert']
    };

    if (degreeTypes[selectedDegree]) {
      return degreeTypes[selectedDegree].some(type => courseDegree.includes(type));
    }

    return false;
  }

  // Function to populate course dropdown based on university selection and degree
  function populateCourseDropdown(universityName) {
    const courseSelect = document.getElementById('course');
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    if (!universityName) return;

    const selectedDegree = document.getElementById('degree').value;
    if (!selectedDegree) return;

    // Filter courses for selected university and degree
    const courses = universityData
      .filter(item => {
        const matchesUniversity = item.University_Name === universityName;
        const matchesDegree = degreesMatch(item.Degree, selectedDegree);
        return matchesUniversity && matchesDegree;
      })
      .map(item => item.Course)
      .filter(course => course); // Remove empty/null values

    // Add unique courses to dropdown
    [...new Set(courses)].sort().forEach(course => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      courseSelect.appendChild(option);
    });

    // Log for debugging
    console.log(`Found ${courses.length} courses for ${universityName} with degree ${selectedDegree}`);
  }

  // Add degree change event listener to update courses when degree changes
  document.getElementById('degree').addEventListener('change', function () {
    const selectedUniversity = document.getElementById('university').value;
    if (selectedUniversity) {
      populateCourseDropdown(selectedUniversity);
    }
    // Clear course selection when degree changes
    document.getElementById('course').innerHTML = '<option value="">Select Course</option>';
  });

  // Add university change event listener
  document.getElementById('university').addEventListener('change', function (e) {
    populateCourseDropdown(e.target.value);
    setupLocationDropdown(currentCountry);
  });

  // Add course change event listener
  document.getElementById('course').addEventListener('change', function () {
    setupLocationDropdown(currentCountry);
  });
});

// Download functionality
let downloadMenuVisible = false;

document.getElementById('downloadBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  downloadMenuVisible = !downloadMenuVisible;
  const options = document.querySelector('.download-options');

  if (downloadMenuVisible) {
    options.classList.add('show');

    // Close when clicking outside
    const clickHandler = function (event) {
      if (!options.contains(event.target) && event.target !== this) {
        options.classList.remove('show');
        downloadMenuVisible = false;
        document.removeEventListener('click', clickHandler);
      }
    };

    document.addEventListener('click', clickHandler);
  } else {
    options.classList.remove('show');
  }
});

// Smooth hover implementation
document.querySelectorAll('.download-option').forEach(option => {
  option.addEventListener('mouseenter', function () {
    this.style.backgroundColor = '#f5f5f5';
  });

  option.addEventListener('mouseleave', function () {
    this.style.backgroundColor = 'white';
  });

  option.addEventListener('click', function (e) {
    e.stopPropagation();
    const type = this.getAttribute('data-type');
    const filteredData = getCurrentFilteredData();

    if (!filteredData || filteredData.length === 0) {
      alert('No data available to download');
      return;
    }

    if (type === 'pdf') {
      // Show client details modal before downloading
      showClientDetailsModal(filteredData);
    } else {
      downloadAsCSV(filteredData);
    }

    document.querySelector('.download-options').classList.remove('show');
    downloadMenuVisible = false;
  });
});

// Email functionality
document.getElementById('emailBtn').addEventListener('click', function () {
  const filteredData = getCurrentFilteredData();
  if (!filteredData || filteredData.length === 0) {
    alert('No data available to email');
    return;
  }
  showEmailModal(filteredData);
});

// Email Modal
function showEmailModal(data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
        <div class="modal-content">
            <h3>Email University Results</h3>
            <div class="form-group">
                <label for="senderEmail">Your Email:</label>
                <input type="email" id="senderEmail" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label for="clientEmail">Recipient Email:</label>
                <input type="email" id="clientEmail" placeholder="client@example.com" required>
            </div>
            <div class="form-group">
                <label for="emailSubject">Subject:</label>
                <input type="text" id="emailSubject" value="Your University Search Results" required>
            </div>
            <div class="form-group">
                <label for="emailMessage">Message:</label>
                <textarea id="emailMessage" rows="4" required>Dear Client,

Please find attached the university search results you requested.

Best regards,
University Finder Team</textarea>
            </div>
            <div class="attachment-section">
                <h4>Attachments</h4>
                <div class="attachment-list" id="attachmentList"></div>
                <input type="file" id="attachmentInput" class="attachment-input" multiple>
                <button type="button" class="add-attachment-btn" onclick="document.getElementById('attachmentInput').click()">
                    <i class="fas fa-paperclip"></i> Add Attachment
                </button>
            </div>
            <div class="form-group">
                <label for="emailClient">Choose Email Client:</label>
                <select id="emailClient" required>
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Microsoft Outlook</option>
                    <option value="default">Default Email Client</option>
                </select>
            </div>
            <div id="gmailAuthSection" style="margin: 15px 0; display: none;">
                <button id="gmailSignInBtn" class="modal-btn" style="background-color: #DB4437; color: white;">
                    <i class="fab fa-google"></i> Sign in with Gmail
                </button>
                <p id="gmailAuthStatus" style="margin-top: 10px; font-size: 14px; color: #666;"></p>
            </div>
            <div class="modal-actions">
                <button id="sendEmail" class="modal-btn primary">
                    <i class="fas fa-paper-plane"></i> Send Email
                </button>
                <button id="cancelEmail" class="modal-btn secondary">
                    Cancel
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Handle email client selection
  const emailClientSelect = document.getElementById('emailClient');
  const gmailAuthSection = document.getElementById('gmailAuthSection');
  const gmailSignInBtn = document.getElementById('gmailSignInBtn');
  const gmailAuthStatus = document.getElementById('gmailAuthStatus');

  emailClientSelect.addEventListener('change', function () {
    gmailAuthSection.style.display = this.value === 'gmail' ? 'block' : 'none';
  });

  // Initialize Gmail API when selecting Gmail
  if (emailClientSelect.value === 'gmail') {
    gmailAuthSection.style.display = 'block';
  }

  // Handle Gmail sign-in
  gmailSignInBtn.addEventListener('click', async () => {
    try {
      await loadGmailApi();
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      if (isSignedIn) {
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const profile = user.getBasicProfile();
        gmailAuthStatus.textContent = `Signed in as ${profile.getEmail()}`;
        gmailAuthStatus.style.color = '#28a745';
        document.getElementById('senderEmail').value = profile.getEmail();
      }
    } catch (error) {
      console.error('Gmail sign-in error:', error);
      gmailAuthStatus.textContent = 'Failed to sign in. Please try again.';
      gmailAuthStatus.style.color = '#dc3545';
    }
  });

  // Handle file attachments
  const attachmentInput = document.getElementById('attachmentInput');
  const attachmentList = document.getElementById('attachmentList');
  const attachments = new Set();

  attachmentInput.addEventListener('change', function (e) {
    const files = e.target.files;
    for (let file of files) {
      if (!attachments.has(file.name)) {
        attachments.add(file.name);
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        attachmentItem.innerHTML = `
          <i class="fas fa-file"></i>
          ${file.name}
          <span class="remove-attachment" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
          </span>
        `;
        attachmentList.appendChild(attachmentItem);
      }
    }
    attachmentInput.value = ''; // Reset input
  });

  // Handle send email
  document.getElementById('sendEmail').addEventListener('click', async function () {
    const senderEmail = document.getElementById('senderEmail').value.trim();
    const clientEmail = document.getElementById('clientEmail').value.trim();
    const subject = document.getElementById('emailSubject').value.trim();
    const message = document.getElementById('emailMessage').value.trim();
    const emailClient = document.getElementById('emailClient').value;

    if (!validateEmail(senderEmail)) {
      alert('Please enter a valid sender email address');
      return;
    }

    if (!validateEmail(clientEmail)) {
      alert('Please enter a valid recipient email address');
      return;
    }

    const emailData = {
      to: clientEmail,
      from: senderEmail,
      subject: subject,
      body: message,
      attachments: Array.from(attachmentList.children).map(item => item.textContent.trim())
    };

    // Open email client based on selection
    openEmailClient(emailClient, emailData);
    modal.remove();
  });

  document.getElementById('cancelEmail').addEventListener('click', function () {
    modal.remove();
  });
}

function formatEmailContent(data, message) {
  let content = message + '\n\n';
  content += 'University Search Results:\n\n';

  // Add table headers
  content += 'University | Degree | Location | Score | Fee | Program Name\n';
  content += '----------|---------|----------|--------|-----|-------------\n';

  // Add table data
  data.forEach(row => {
    content += `${row.University_Name} | ${row.Degree} | ${row.Location} | `;
    content += `${row.Percentage_CGPA} | ${row.Fee} | ${row.Program_Name || 'N/A'}\n`;
  });

  return content;
}

function showAttachmentInstructions(callback) {
  const instructionModal = document.createElement('div');
  instructionModal.className = 'modal-overlay';
  instructionModal.innerHTML = `
    <div class="modal-content attachment-instructions">
      <h3>Attachment Instructions</h3>
      <div class="instruction-content">
        <p>Due to browser security restrictions, files need to be attached manually in your email client.</p>
        <ol>
          <li>Click "Continue" to open your email client</li>
          <li>When your email client opens, locate the attachment button</li>
          <li>Select the files you previously chose to attach</li>
        </ol>
        <div class="files-to-attach">
          <h4>Files to Attach:</h4>
          <ul>
            ${Array.from(document.getElementById('attachmentList').children)
      .map(item => `<li><i class="fas fa-file"></i> ${item.textContent.trim()}</li>`)
      .join('')}
          </ul>
        </div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn primary" id="continueWithEmail">
          <i class="fas fa-check"></i> Continue
        </button>
        <button class="modal-btn secondary" id="cancelInstructions">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(instructionModal);

  document.getElementById('continueWithEmail').addEventListener('click', function () {
    instructionModal.remove();
    if (callback) callback();
  });

  document.getElementById('cancelInstructions').addEventListener('click', function () {
    instructionModal.remove();
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Update getCurrentFilteredData function to get only visible/filtered rows
function getCurrentFilteredData() {
  // Get all visible rows (not hidden by display: none)
  const rows = document.querySelectorAll('#resultsTable tbody tr:not([style*="display: none"])');
  if (rows.length === 0) return null;

  const headers = Array.from(document.querySelectorAll('#resultsTable thead th'))
    .map(th => th.textContent.trim().replace(/\s+/g, '_'));

  // Get active filters
  const activeFilters = getActiveFilters();
  const hasActiveFilters = Object.values(activeFilters).some(filter =>
    filter && (Array.isArray(filter) ? filter.length > 0 : filter !== '')
  );

  // If no filters are active, return all data
  if (!hasActiveFilters) {
    return Array.from(document.querySelectorAll('#resultsTable tbody tr')).map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const rowData = {};
      cells.forEach((cell, index) => {
        if (headers[index] === 'Program_Name') {
          const input = cell.querySelector('input');
          rowData[headers[index]] = input ? input.value.trim() || 'N/A' : 'N/A';
        } else {
          rowData[headers[index]] = cell.textContent.trim();
        }
      });
      return rowData;
    });
  }

  // Return only filtered data
  return Array.from(rows).map(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    const rowData = {};
    cells.forEach((cell, index) => {
      if (headers[index] === 'Program_Name') {
        const input = cell.querySelector('input');
        rowData[headers[index]] = input ? input.value.trim() || 'N/A' : 'N/A';
      } else {
        rowData[headers[index]] = cell.textContent.trim();
      }
    });
    return rowData;
  });
}

// Function for download as CSV
function downloadAsCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `university_results_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Update downloadAsPDF function to handle filtered data
function downloadAsPDF(data, clientDetails) {
  try {
    console.log('Starting PDF generation...');
    console.log('Data:', data);
    console.log('Client Details:', clientDetails);
    console.log('Current Country:', currentCountry);
    console.log('Country Config:', countryConfigs[currentCountry]);

    // Make sure jsPDF is available
    if (typeof window.jsPDF === 'undefined') {
      throw new Error('jsPDF library not loaded');
    }

    // Make sure we have data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to generate PDF');
    }

    // Make sure we have valid country configuration
    if (!countryConfigs[currentCountry]) {
      throw new Error('Invalid country configuration');
    }

    console.log('Creating PDF document...');
    // Initialize jsPDF with landscape orientation
    const doc = new window.jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3' // Changed to A3 for better fit of all columns
    });

    console.log('Adding header content...');
    // Add title
    doc.setFontSize(16);
    doc.text('APTITUDE MIGRATION - Options as per client Profile', 14, 15);

    // Add client details
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Client Name: ${clientDetails.clientName}`, 14, 25);
    doc.text(`City: ${clientDetails.clientCity}`, 14, 32);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 39);

    console.log('Preparing table data...');
    // Prepare data with proper text handling
    const headers = [
      { title: "University", dataKey: "University_Name" },
      { title: "Location", dataKey: "Location" },
      { title: "Degree", dataKey: "Degree" },
      { title: "Course", dataKey: "Course" },
      { title: "Intake", dataKey: "Intake" },
      { title: "Score", dataKey: "Percentage_CGPA" },
      { title: "English Test", dataKey: "English_Test" },
      { title: "Study Gap", dataKey: "Study_Gap" },
      { title: "Field", dataKey: "Field_of_Study" },
      { title: `Fee (${countryConfigs[currentCountry].currencySymbol})`, dataKey: "Fee" },
      { title: `Deposit (${countryConfigs[currentCountry].currencySymbol})`, dataKey: "Initial_Deposit" },
      { title: "Remarks", dataKey: "Other_Remarks" },
      { title: "Course Link", dataKey: "Course_link" }
    ];

    // Process data to ensure proper formatting
    const pdfData = data.map(row => {
      const processedRow = {};
      headers.forEach(header => {
        let value = row[header.dataKey];
        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = 'N/A';
        }
        // Handle special cases for Fee and Initial_Deposit
        if (header.dataKey === 'Fee' || header.dataKey === 'Initial_Deposit') {
          processedRow[header.dataKey] = formatCurrencyForPDF(value);
        } else if (header.dataKey === 'Course_link') {
          // For course links, just show 'View Course' or 'N/A'
          processedRow[header.dataKey] = value && value !== 'N/A' ? 'View Course' : 'N/A';
        } else {
          processedRow[header.dataKey] = String(value);
        }
      });
      return processedRow;
    });

    console.log('Generating table...');
    // Generate the table with improved settings
    doc.autoTable({
      head: [headers.map(h => h.title)],
      body: pdfData.map(row => headers.map(h => row[h.dataKey])),
      startY: 45,
      margin: { left: 5, right: 5 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'center',
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        minCellHeight: 5
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        minCellHeight: 10
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center' }, // University
        1: { cellWidth: 25, halign: 'center' }, // Location
        2: { cellWidth: 20, halign: 'center' }, // Degree
        3: { cellWidth: 35, halign: 'center' }, // Course
        4: { cellWidth: 15, halign: 'center' }, // Intake
        5: { cellWidth: 15, halign: 'center' }, // Score
        6: { cellWidth: 20, halign: 'center' }, // English Test
        7: { cellWidth: 15, halign: 'center' }, // Study Gap
        8: { cellWidth: 25, halign: 'center' }, // Field
        9: { cellWidth: 20, halign: 'center' }, // Fee
        10: { cellWidth: 20, halign: 'center' }, // Deposit
        11: { cellWidth: 30, halign: 'center' }, // Remarks
        12: { cellWidth: 20, halign: 'center' }  // Course Link
      },
      didParseCell: function (data) {
        // Adjust cell height based on content
        const text = data.cell.text;
        if (Array.isArray(text) && text.length > 0) {
          const textLength = text.join(' ').length;
          if (textLength > 50) {
            data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight, textLength / 20);
          }
        }
      },
      didDrawPage: function (data) {
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${data.pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
    });

    console.log('Saving PDF...');
    // Save the PDF
    const filename = `university_results_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    console.log('PDF generated successfully!');

  } catch (error) {
    console.error('Detailed error in PDF generation:', error);
    console.error('Error stack:', error.stack);
    alert(`Error generating PDF: ${error.message}. Please check the console for details.`);
  }
}

// Helper function to truncate long text
function truncateText(text, maxLength) {
  if (!text) return 'N/A';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

// Helper function for currency formatting in PDF
function formatCurrencyForPDF(value, country = currentCountry) {
  if (!value) return 'N/A';
  const symbol = countryConfigs[country].currencySymbol;
  const num = parseFloat(value.replace(/[^\d.]/g, ''));
  return isNaN(num) ? value : symbol + num.toLocaleString('en-GB');
}

// Close dropdown when clicking outside
document.addEventListener('click', function () {
  document.querySelector('.download-options').classList.remove('show');
});

// Helper function to get active filters
function getActiveFilters() {
  return {
    degree: document.getElementById('degree').value !== 'Degree' ? document.getElementById('degree').value : null,
    englishTests: Array.from(document.querySelectorAll('input[name="englishTest"]:checked')).map(el => el.value),
    locations: Array.from(document.querySelectorAll('input[name="location"]:checked')).map(el => el.value),
    cgpa: document.getElementById('cgpa').value,
    fields: Array.from(document.querySelectorAll('input[name="field"]:checked')).map(el => el.value),
    fee: document.getElementById('fee').value
  };
}

// Add function to show client details modal
function showClientDetailsModal(data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <h3>Client Details</h3>
      <div class="form-group">
        <label for="clientName">Client Name:</label>
        <input type="text" id="clientName" placeholder="Enter client name" required>
      </div>
      <div class="form-group">
        <label for="clientCity">City:</label>
        <input type="text" id="clientCity" placeholder="Enter city" required>
      </div>
      <div class="modal-actions">
        <button id="proceedDownload" class="modal-btn primary">
          <i class="fas fa-download"></i> Download PDF
        </button>
        <button id="cancelDownload" class="modal-btn secondary">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle download
  document.getElementById('proceedDownload').addEventListener('click', function () {
    const clientName = document.getElementById('clientName').value.trim();
    const clientCity = document.getElementById('clientCity').value.trim();

    if (!clientName || !clientCity) {
      alert('Please enter both client name and city');
      return;
    }

    downloadAsPDF(data, { clientName, clientCity });
    modal.remove();
  });

  document.getElementById('cancelDownload').addEventListener('click', function () {
    modal.remove();
  });
}
