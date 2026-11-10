/* BIBILEARN — contenu pédagogique original.
   Ordre des colonnes : voir LANG_ORDER. Pour ru, el, ja, zh : "texte|romanisation". */
const LANGS = {
  en:   { name:"Anglais (Royaume-Uni)", native:"English (UK)", flag:"🇬🇧", tts:"en-GB" },
  it:   { name:"Italien (Italie)", native:"Italiano", flag:"🇮🇹", tts:"it-IT" },
  fr:   { name:"Français (France)", native:"Français", flag:"🇫🇷", tts:"fr-FR" },
  ro:   { name:"Roumain (Roumanie)", native:"Română", flag:"🇷🇴", tts:"ro-RO" },
  ptBR: { name:"Portugais (Brésil)", native:"Português (Brasil)", flag:"🇧🇷", tts:"pt-BR" },
  ptPT: { name:"Portugais (Portugal)", native:"Português (Portugal)", flag:"🇵🇹", tts:"pt-PT" },
  esES: { name:"Espagnol (Espagne)", native:"Español (España)", flag:"🇪🇸", tts:"es-ES" },
  esMX: { name:"Espagnol (Mexique)", native:"Español (México)", flag:"🇲🇽", tts:"es-MX" },
  esAR: { name:"Espagnol (Argentine)", native:"Español (Argentina)", flag:"🇦🇷", tts:"es-AR" },
  de:   { name:"Allemand (Allemagne)", native:"Deutsch", flag:"🇩🇪", tts:"de-DE" },
  ru:   { name:"Russe (Russie)", native:"Русский", flag:"🇷🇺", tts:"ru-RU" },
  el:   { name:"Grec moderne", native:"Ελληνικά", flag:"🇬🇷", tts:"el-GR" },
  nl:   { name:"Néerlandais", native:"Nederlands", flag:"🇳🇱", tts:"nl-NL" },
  ja:   { name:"Japonais", native:"日本語", flag:"🇯🇵", tts:"ja-JP" },
  zh:   { name:"Chinois (mandarin)", native:"中文（普通话）", flag:"🇨🇳", tts:"zh-CN" }
};
const LANG_ORDER = ["en","it","fr","ro","ptBR","ptPT","esES","esMX","esAR","de","ru","el","nl","ja","zh"];

const THEMES = [
  { id:"greet",  icon:"👋", fr:"Salutations", ro:"Saluturi", en:"Greetings", it:"Saluti" },
  { id:"polite", icon:"🙏", fr:"Politesse", ro:"Politețe", en:"Politeness", it:"Cortesia" },
  { id:"food",   icon:"🍓", fr:"Nourriture", ro:"Mâncare", en:"Food", it:"Cibo" },
  { id:"travel", icon:"🚌", fr:"Transports", ro:"Transport", en:"Transport", it:"Trasporti" },
  { id:"home",   icon:"🏠", fr:"Maison & famille", ro:"Casă & familie", en:"Home & family", it:"Casa e famiglia" },
  { id:"work",   icon:"💼", fr:"Travail & temps", ro:"Muncă & timp", en:"Work & time", it:"Lavoro e tempo" }
];

/* r:1 = mot qui change selon le pays (variante régionale) */
const ITEMS = [
 ["greet",0,["Hello","Ciao","Bonjour","Bună ziua","Olá","Olá","Hola","Hola","Hola","Hallo","Здравствуйте|Zdrávstvuyte","Γεια σας|Ya sas","Hallo","こんにちは|konnichiwa","你好|nǐ hǎo"]],
 ["greet",0,["Good morning","Buongiorno","Bonjour (le matin)","Bună dimineața","Bom dia","Bom dia","Buenos días","Buenos días","Buen día","Guten Morgen","Доброе утро|Dóbroye útro","Καλημέρα|Kaliméra","Goedemorgen","おはようございます|ohayō gozaimasu","早上好|zǎoshang hǎo"]],
 ["greet",0,["Good evening","Buonasera","Bonsoir","Bună seara","Boa noite","Boa noite","Buenas noches","Buenas noches","Buenas noches","Guten Abend","Добрый вечер|Dóbryy vécher","Καλησπέρα|Kalispéra","Goedenavond","こんばんは|konbanwa","晚上好|wǎnshang hǎo"]],
 ["greet",1,["Goodbye","Arrivederci","Au revoir","La revedere","Tchau","Adeus","Adiós","Adiós","Chau","Auf Wiedersehen","До свидания|Do svidániya","Αντίο|Antío","Tot ziens","さようなら|sayōnara","再见|zàijiàn"]],
 ["greet",1,["How are you?","Come stai?","Comment ça va ?","Ce mai faci?","Tudo bem?","Como estás?","¿Cómo estás?","¿Cómo estás?","¿Cómo andás?","Wie geht's?","Как дела?|Kak delá?","Τι κάνεις;|Ti káneis?","Hoe gaat het?","お元気ですか？|o-genki desu ka?","你好吗？|nǐ hǎo ma?"]],
 ["greet",1,["My name is Anna.","Mi chiamo Anna.","Je m'appelle Anna.","Mă numesc Anna.","Meu nome é Anna.","Chamo-me Anna.","Me llamo Anna.","Me llamo Anna.","Me llamo Anna.","Ich heiße Anna.","Меня зовут Анна.|Menyá zovút Ánna.","Με λένε Άννα.|Me léne Ánna.","Ik heet Anna.","私はアンナです。|watashi wa Anna desu.","我叫安娜。|wǒ jiào Ānnà."]],
 ["greet",1,["Nice to meet you.","Piacere.","Enchanté(e).","Încântat(ă).","Prazer.","Muito prazer.","Encantado.","Mucho gusto.","Mucho gusto.","Freut mich.","Очень приятно.|Óchen' priyátno.","Χάρηκα.|Chárika.","Aangenaam.","はじめまして。|hajimemashite.","很高兴认识你。|hěn gāoxìng rènshi nǐ."]],
 ["greet",0,["See you tomorrow!","A domani!","À demain !","Pe mâine!","Até amanhã!","Até amanhã!","¡Hasta mañana!","¡Hasta mañana!","¡Hasta mañana!","Bis morgen!","До завтра!|Do závtra!","Τα λέμε αύριο!|Ta léme ávrio!","Tot morgen!","また明日！|mata ashita!","明天见！|míngtiān jiàn!"]],

 ["polite",0,["Please","Per favore","S'il vous plaît","Vă rog","Por favor","Por favor","Por favor","Por favor","Por favor","Bitte","Пожалуйста|Pozhálujsta","Παρακαλώ|Parakaló","Alstublieft","お願いします|onegai shimasu","请|qǐng"]],
 ["polite",0,["Thank you","Grazie","Merci","Mulțumesc","Obrigado","Obrigado","Gracias","Gracias","Gracias","Danke","Спасибо|Spasíbo","Ευχαριστώ|Efcharistó","Dank je wel","ありがとう|arigatō","谢谢|xièxie"]],
 ["polite",0,["You're welcome","Prego","De rien","Cu plăcere","De nada","De nada","De nada","De nada","De nada","Gern geschehen","Не за что|Ne za chto","Τίποτα|Típota","Graag gedaan","どういたしまして|dō itashimashite","不客气|bú kèqi"]],
 ["polite",1,["Excuse me","Scusi","Excusez-moi","Scuzați-mă","Com licença","Com licença","Perdone","Disculpe","Disculpá","Entschuldigung","Извините|Izviníte","Συγγνώμη|Signómi","Pardon","すみません|sumimasen","不好意思|bù hǎoyìsi"]],
 ["polite",0,["Yes","Sì","Oui","Da","Sim","Sim","Sí","Sí","Sí","Ja","Да|Da","Ναι|Ne","Ja","はい|hai","是|shì"]],
 ["polite",0,["No","No","Non","Nu","Não","Não","No","No","No","Nein","Нет|Net","Όχι|Óchi","Nee","いいえ|iie","不|bù"]],
 ["polite",1,["I don't understand.","Non capisco.","Je ne comprends pas.","Nu înțeleg.","Não entendo.","Não percebo.","No entiendo.","No entiendo.","No entiendo.","Ich verstehe nicht.","Я не понимаю.|Ya ne ponimáyu.","Δεν καταλαβαίνω.|Den katalavéno.","Ik begrijp het niet.","わかりません。|wakarimasen.","我不明白。|wǒ bù míngbai."]],
 ["polite",0,["Could you repeat that, please?","Può ripetere, per favore?","Pouvez-vous répéter, s'il vous plaît ?","Puteți repeta, vă rog?","Pode repetir, por favor?","Pode repetir, por favor?","¿Puede repetir, por favor?","¿Puede repetir, por favor?","¿Puede repetir, por favor?","Können Sie das bitte wiederholen?","Повторите, пожалуйста.|Povtoríte, pozhálujsta.","Μπορείτε να το επαναλάβετε, παρακαλώ;|Boríte na to epanalávete, parakaló?","Kunt u dat herhalen, alstublieft?","もう一度お願いします。|mō ichido onegai shimasu.","请再说一遍。|qǐng zài shuō yí biàn."]],

 ["food",0,["Water","Acqua","Eau","Apă","Água","Água","Agua","Agua","Agua","Wasser","Вода|Vodá","Νερό|Neró","Water","水|mizu","水|shuǐ"]],
 ["food",0,["Bread","Pane","Pain","Pâine","Pão","Pão","Pan","Pan","Pan","Brot","Хлеб|Khleb","Ψωμί|Psomí","Brood","パン|pan","面包|miànbāo"]],
 ["food",0,["Coffee","Caffè","Café","Cafea","Café","Café","Café","Café","Café","Kaffee","Кофе|Kófe","Καφές|Kafés","Koffie","コーヒー|kōhī","咖啡|kāfēi"]],
 ["food",1,["Juice","Succo","Jus","Suc","Suco","Sumo","Zumo","Jugo","Jugo","Saft","Сок|Sok","Χυμός|Chymós","Sap","ジュース|jūsu","果汁|guǒzhī"]],
 ["food",1,["Breakfast","Colazione","Petit-déjeuner","Micul dejun","Café da manhã","Pequeno-almoço","Desayuno","Desayuno","Desayuno","Frühstück","Завтрак|Závtrak","Πρωινό|Proinó","Ontbijt","朝ご飯|asagohan","早饭|zǎofàn"]],
 ["food",1,["Strawberry","Fragola","Fraise","Căpșună","Morango","Morango","Fresa","Fresa","Frutilla","Erdbeere","Клубника|Klubníka","Φράουλα|Fráoula","Aardbei","いちご|ichigo","草莓|cǎoméi"]],
 ["food",1,["Avocado","Avocado","Avocat","Avocado","Abacate","Abacate","Aguacate","Aguacate","Palta","Avocado","Авокадо|Avokádo","Αβοκάντο|Avokánto","Avocado","アボカド|abokado","牛油果|niúyóuguǒ"]],
 ["food",0,["The bill, please.","Il conto, per favore.","L'addition, s'il vous plaît.","Nota, vă rog.","A conta, por favor.","A conta, por favor.","La cuenta, por favor.","La cuenta, por favor.","La cuenta, por favor.","Die Rechnung, bitte.","Счёт, пожалуйста.|Schyot, pozhálujsta.","Τον λογαριασμό, παρακαλώ.|Ton logariasmó, parakaló.","De rekening, alstublieft.","お会計お願いします。|okaikei onegai shimasu.","请买单。|qǐng mǎidān."]],
 ["food",0,["I'm hungry.","Ho fame.","J'ai faim.","Mi-e foame.","Estou com fome.","Estou com fome.","Tengo hambre.","Tengo hambre.","Tengo hambre.","Ich habe Hunger.","Я голоден.|Ya góloden.","Πεινάω.|Pináo.","Ik heb honger.","お腹が空きました。|onaka ga sukimashita.","我饿了。|wǒ è le."]],
 ["food",0,["A table for two, please.","Un tavolo per due, per favore.","Une table pour deux, s'il vous plaît.","O masă pentru două persoane, vă rog.","Uma mesa para dois, por favor.","Uma mesa para dois, por favor.","Una mesa para dos, por favor.","Una mesa para dos, por favor.","Una mesa para dos, por favor.","Einen Tisch für zwei, bitte.","Столик на двоих, пожалуйста.|Stólik na dvoíkh, pozhálujsta.","Ένα τραπέζι για δύο, παρακαλώ.|Éna trapézi ya dýo, parakaló.","Een tafel voor twee, alstublieft.","二人です。|futari desu.","两位。|liǎng wèi."]],

 ["travel",1,["Bus","Autobus","Bus","Autobuz","Ônibus","Autocarro","Autobús","Camión","Colectivo","Bus","Автобус|Avtóbus","Λεωφορείο|Leoforío","Bus","バス|basu","公交车|gōngjiāochē"]],
 ["travel",1,["Car","Macchina","Voiture","Mașină","Carro","Carro","Coche","Carro","Auto","Auto","Машина|Mashína","Αυτοκίνητο|Aftokínito","Auto","車|kuruma","汽车|qìchē"]],
 ["travel",1,["Train","Treno","Train","Tren","Trem","Comboio","Tren","Tren","Tren","Zug","Поезд|Póyezd","Τρένο|Tréno","Trein","電車|densha","火车|huǒchē"]],
 ["travel",1,["Ticket","Biglietto","Billet","Bilet","Passagem","Bilhete","Billete","Boleto","Pasaje","Fahrkarte","Билет|Bilét","Εισιτήριο|Isitírio","Kaartje","切符|kippu","票|piào"]],
 ["travel",0,["Airport","Aeroporto","Aéroport","Aeroport","Aeroporto","Aeroporto","Aeropuerto","Aeropuerto","Aeropuerto","Flughafen","Аэропорт|Aeropórt","Αεροδρόμιο|Aerodrómio","Vliegveld","空港|kūkō","机场|jīchǎng"]],
 ["travel",0,["Where is the station?","Dov'è la stazione?","Où est la gare ?","Unde este gara?","Onde fica a estação?","Onde fica a estação?","¿Dónde está la estación?","¿Dónde está la estación?","¿Dónde está la estación?","Wo ist der Bahnhof?","Где вокзал?|Gde vokzál?","Πού είναι ο σταθμός;|Pou íne o stathmós?","Waar is het station?","駅はどこですか？|eki wa doko desu ka?","车站在哪里？|chēzhàn zài nǎlǐ?"]],
 ["travel",0,["Left","Sinistra","Gauche","Stânga","Esquerda","Esquerda","Izquierda","Izquierda","Izquierda","Links","Налево|Nalévo","Αριστερά|Aristerá","Links","左|hidari","左|zuǒ"]],
 ["travel",0,["Right","Destra","Droite","Dreapta","Direita","Direita","Derecha","Derecha","Derecha","Rechts","Направо|Naprávo","Δεξιά|Dexiá","Rechts","右|migi","右|yòu"]],

 ["home",0,["House","Casa","Maison","Casă","Casa","Casa","Casa","Casa","Casa","Haus","Дом|Dom","Σπίτι|Spíti","Huis","家|ie","家|jiā"]],
 ["home",1,["Flat","Appartamento","Appartement","Apartament","Apartamento","Apartamento","Piso","Departamento","Departamento","Wohnung","Квартира|Kvartíra","Διαμέρισμα|Diamérisma","Appartement","アパート|apāto","公寓|gōngyù"]],
 ["home",1,["Lift","Ascensore","Ascenseur","Lift","Elevador","Elevador","Ascensor","Elevador","Ascensor","Aufzug","Лифт|Lift","Ασανσέρ|Asansér","Lift","エレベーター|erebētā","电梯|diàntī"]],
 ["home",0,["Family","Famiglia","Famille","Familie","Família","Família","Familia","Familia","Familia","Familie","Семья|Sem'yá","Οικογένεια|Ikogénia","Familie","家族|kazoku","家庭|jiātíng"]],
 ["home",0,["Mother","Madre","Mère","Mamă","Mãe","Mãe","Madre","Madre","Madre","Mutter","Мать|Mat'","Μητέρα|Mitéra","Moeder","母|haha","母亲|mǔqīn"]],
 ["home",0,["Father","Padre","Père","Tată","Pai","Pai","Padre","Padre","Padre","Vater","Отец|Otéts","Πατέρας|Patéras","Vader","父|chichi","父亲|fùqīn"]],
 ["home",1,["Children","Bambini","Enfants","Copii","Crianças","Crianças","Niños","Niños","Chicos","Kinder","Дети|Déti","Παιδιά|Paidiá","Kinderen","子供|kodomo","孩子|háizi"]],

 ["work",1,["Computer","Computer","Ordinateur","Calculator","Computador","Computador","Ordenador","Computadora","Computadora","Computer","Компьютер|Kompyúter","Υπολογιστής|Ypologistís","Computer","パソコン|pasokon","电脑|diànnǎo"]],
 ["work",1,["Mobile phone","Cellulare","Portable","Telefon mobil","Celular","Telemóvel","Móvil","Celular","Celular","Handy","Мобильный телефон|Mobíl'nyy telefón","Κινητό|Kinitó","Mobieltje","携帯電話|keitai denwa","手机|shǒujī"]],
 ["work",1,["Money","Soldi","Argent","Bani","Dinheiro","Dinheiro","Dinero","Dinero","Plata","Geld","Деньги|Dén'gi","Χρήματα|Chrímata","Geld","お金|okane","钱|qián"]],
 ["work",0,["Today","Oggi","Aujourd'hui","Astăzi","Hoje","Hoje","Hoy","Hoy","Hoy","Heute","Сегодня|Segódnya","Σήμερα|Símera","Vandaag","今日|kyō","今天|jīntiān"]],
 ["work",0,["Tomorrow","Domani","Demain","Mâine","Amanhã","Amanhã","Mañana","Mañana","Mañana","Morgen","Завтра|Závtra","Αύριο|Ávrio","Morgen","明日|ashita","明天|míngtiān"]],
 ["work",1,["I work in an office.","Lavoro in un ufficio.","Je travaille dans un bureau.","Lucrez într-un birou.","Trabalho em um escritório.","Trabalho num escritório.","Trabajo en una oficina.","Trabajo en una oficina.","Trabajo en una oficina.","Ich arbeite in einem Büro.","Я работаю в офисе.|Ya rabótayu v ófise.","Δουλεύω σε γραφείο.|Doulévo se grafío.","Ik werk op kantoor.","私は事務所で働いています。|watashi wa jimusho de hataraite imasu.","我在办公室工作。|wǒ zài bàngōngshì gōngzuò."]],
 ["work",0,["What time is it?","Che ore sono?","Quelle heure est-il ?","Cât e ceasul?","Que horas são?","Que horas são?","¿Qué hora es?","¿Qué hora es?","¿Qué hora es?","Wie spät ist es?","Который час?|Kotóryy chas?","Τι ώρα είναι;|Ti óra íne?","Hoe laat is het?","今何時ですか？|ima nanji desu ka?","现在几点？|xiànzài jǐ diǎn?"]]
];

/* Histoires bilingues (lecture avec traduction phrase par phrase, comme les livres EWA) */
const STORIES = [
 { id:"cafe", icon:"☕", title:{fr:"Au café",ro:"La cafenea",en:"At the café",it:"Al bar"}, level:"A1", s:[
  ["Anna walks into a small café.","Anna entra in un piccolo bar.","Anna entre dans un petit café.","Anna intră într-o cafenea mică.","Anna entra em um pequeno café.","A Anna entra num pequeno café.","Anna entra en una pequeña cafetería.","Anna entra a una pequeña cafetería.","Anna entra a un pequeño café.","Anna geht in ein kleines Café.","Анна заходит в маленькое кафе.|Ánna zakhódit v malén'koye kafé.","Η Άννα μπαίνει σε ένα μικρό καφέ.|I Ánna bénei se éna mikró kafé.","Anna loopt een klein café binnen.","アンナは小さなカフェに入ります。|Anna wa chiisana kafe ni hairimasu.","安娜走进一家小咖啡馆。|Ānnà zǒujìn yì jiā xiǎo kāfēiguǎn."],
  ["She orders a coffee and a croissant.","Ordina un caffè e un cornetto.","Elle commande un café et un croissant.","Comandă o cafea și un croissant.","Ela pede um café e um croissant.","Pede um café e um croissant.","Pide un café y un cruasán.","Pide un café y un cuernito.","Pide un café y una medialuna.","Sie bestellt einen Kaffee und ein Croissant.","Она заказывает кофе и круассан.|Oná zakázyvayet kófe i kruassán.","Παραγγέλνει έναν καφέ και ένα κρουασάν.|Parangélnei énan kafé ke éna krouasán.","Ze bestelt een koffie en een croissant.","コーヒーとクロワッサンを注文します。|kōhī to kurowassan o chūmon shimasu.","她点了一杯咖啡和一个羊角面包。|Tā diǎnle yì bēi kāfēi hé yí gè yángjiǎo miànbāo."],
  ["The waiter is very friendly.","Il cameriere è molto gentile.","Le serveur est très gentil.","Chelnerul este foarte amabil.","O garçom é muito simpático.","O empregado de mesa é muito simpático.","El camarero es muy amable.","El mesero es muy amable.","El mozo es muy amable.","Der Kellner ist sehr freundlich.","Официант очень любезный.|Ofitsiánt óchen' lyubéznyy.","Ο σερβιτόρος είναι πολύ ευγενικός.|O servitóros íne polý evgenikós.","De ober is heel vriendelijk.","店員さんはとても親切です。|ten'in-san wa totemo shinsetsu desu.","服务员非常友好。|Fúwùyuán fēicháng yǒuhǎo."],
  ["Anna pays and says thank you.","Anna paga e dice grazie.","Anna paie et dit merci.","Anna plătește și spune mulțumesc.","Anna paga e diz obrigada.","A Anna paga e diz obrigada.","Anna paga y dice gracias.","Anna paga y dice gracias.","Anna paga y dice gracias.","Anna bezahlt und sagt danke.","Анна платит и говорит спасибо.|Ánna plátit i govorít spasíbo.","Η Άννα πληρώνει και λέει ευχαριστώ.|I Ánna pliróni ke léei efcharistó.","Anna betaalt en zegt dank je wel.","アンナはお金を払って、ありがとうと言います。|Anna wa okane o haratte, arigatō to iimasu.","安娜付了钱，说了谢谢。|Ānnà fùle qián, shuōle xièxie."],
  ["Then she goes to work by bus.","Poi va al lavoro in autobus.","Ensuite, elle va au travail en bus.","Apoi merge la serviciu cu autobuzul.","Depois, ela vai para o trabalho de ônibus.","Depois, vai para o trabalho de autocarro.","Luego va al trabajo en autobús.","Luego se va al trabajo en camión.","Después se va al trabajo en colectivo.","Dann fährt sie mit dem Bus zur Arbeit.","Потом она едет на работу на автобусе.|Potóm oná yédet na rabótu na avtóbuse.","Μετά πηγαίνει στη δουλειά με το λεωφορείο.|Metá pigéni sti douliá me to leoforío.","Daarna gaat ze met de bus naar haar werk.","それから、バスで仕事に行きます。|sorekara, basu de shigoto ni ikimasu.","然后她坐公交车去上班。|Ránhòu tā zuò gōngjiāochē qù shàngbān."]
 ]},
 { id:"gare", icon:"🚆", title:{fr:"À la gare",ro:"La gară",en:"At the station",it:"Alla stazione"}, level:"A1", s:[
  ["Tom is at the station.","Tom è alla stazione.","Tom est à la gare.","Tom este la gară.","Tom está na estação.","O Tom está na estação.","Tom está en la estación.","Tom está en la estación.","Tom está en la estación.","Tom ist am Bahnhof.","Том на вокзале.|Tom na vokzále.","Ο Τομ είναι στον σταθμό.|O Tom íne ston stathmó.","Tom is op het station.","トムは駅にいます。|Tomu wa eki ni imasu.","汤姆在火车站。|Tāngmǔ zài huǒchēzhàn."],
  ["He asks: “Where is the train to the airport?”","Chiede: «Dov'è il treno per l'aeroporto?»","Il demande : « Où est le train pour l'aéroport ? »","Întreabă: „Unde este trenul spre aeroport?”","Ele pergunta: “Onde fica o trem para o aeroporto?”","Pergunta: «Onde está o comboio para o aeroporto?»","Pregunta: «¿Dónde está el tren al aeropuerto?»","Pregunta: «¿Dónde está el tren al aeropuerto?»","Pregunta: «¿Dónde está el tren al aeropuerto?»","Er fragt: „Wo ist der Zug zum Flughafen?“","Он спрашивает: «Где поезд в аэропорт?»|On spráshivayet: «Gde póyezd v aeropórt?»","Ρωτάει: «Πού είναι το τρένο για το αεροδρόμιο;»|Rotáei: «Pou íne to tréno ya to aerodrómio?»","Hij vraagt: „Waar is de trein naar het vliegveld?”","「空港行きの電車はどこですか？」と聞きます。|“kūkō-iki no densha wa doko desu ka?” to kikimasu.","他问：“去机场的火车在哪里？”|Tā wèn: “Qù jīchǎng de huǒchē zài nǎlǐ?”"],
  ["A woman answers: “On the left, platform two.”","Una signora risponde: «A sinistra, binario due.»","Une dame répond : « À gauche, quai deux. »","O doamnă răspunde: „În stânga, linia doi.”","Uma senhora responde: “À esquerda, plataforma dois.”","Uma senhora responde: «À esquerda, linha dois.»","Una señora responde: «A la izquierda, andén dos.»","Una señora responde: «A la izquierda, andén dos.»","Una señora responde: «A la izquierda, andén dos.»","Eine Frau antwortet: „Links, Gleis zwei.“","Женщина отвечает: «Налево, вторая платформа».|Zhénshchina otvecháyet: «Nalévo, vtoráya platfórma».","Μια κυρία απαντά: «Αριστερά, αποβάθρα δύο».|Mia kyría apantá: «Aristerá, apováthra dýo».","Een vrouw antwoordt: „Links, spoor twee.”","女の人が「左の二番線です」と答えます。|onna no hito ga “hidari no niban-sen desu” to kotaemasu.","一位女士回答：“在左边，二号站台。”|Yí wèi nǚshì huídá: “Zài zuǒbian, èr hào zhàntái.”"],
  ["Tom buys a ticket.","Tom compra un biglietto.","Tom achète un billet.","Tom cumpără un bilet.","Tom compra uma passagem.","O Tom compra um bilhete.","Tom compra un billete.","Tom compra un boleto.","Tom compra un pasaje.","Tom kauft eine Fahrkarte.","Том покупает билет.|Tom pokupáyet bilét.","Ο Τομ αγοράζει ένα εισιτήριο.|O Tom agorázei éna isitírio.","Tom koopt een kaartje.","トムは切符を買います。|Tomu wa kippu o kaimasu.","汤姆买了一张票。|Tāngmǔ mǎile yì zhāng piào."],
  ["The train leaves at ten o'clock.","Il treno parte alle dieci.","Le train part à dix heures.","Trenul pleacă la ora zece.","O trem sai às dez horas.","O comboio parte às dez horas.","El tren sale a las diez.","El tren sale a las diez.","El tren sale a las diez.","Der Zug fährt um zehn Uhr ab.","Поезд отправляется в десять часов.|Póyezd otpravlyáyetsya v désyat' chasóv.","Το τρένο φεύγει στις δέκα.|To tréno févgei stis déka.","De trein vertrekt om tien uur.","電車は十時に出発します。|densha wa jūji ni shuppatsu shimasu.","火车十点出发。|Huǒchē shí diǎn chūfā."]
 ]}
];
