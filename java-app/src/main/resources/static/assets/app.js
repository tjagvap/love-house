    'use strict';
    let THREE = window.THREE || null;
    window.__threeLoadPromise.then(ready => { if (ready && window.THREE) THREE = window.THREE; });

    // -------------------- 数据与本地保存 --------------------
    const STORE = {
      pets: 'love_house_pets_v2', room: 'love_house_room_v2', profile: 'love_house_profile_v2',
      settings: 'love_house_settings_v2', bottles: 'love_house_bottles_v2', menu: 'love_house_menu_v1'
    };
    // -------------------- 点菜菜单数据：贵州最全，其次各地菜系 / 网红 / 家常 --------------------
    const MENU_CATS = [
      { id: 'today', name: '❤️ 今天想吃' },
      { id: 'orders', name: '🧾 我们的订单' },
      { id: 'gz', name: '🍲 贵州美食' }, { id: 'gzh', name: '🥘 贵州家常' },
      { id: 'home', name: '🍚 家常菜' }, { id: 'chuan', name: '🌶️ 川菜' },
      { id: 'yue', name: '🦐 粤菜' }, { id: 'xiang', name: '🔥 湘菜' },
      { id: 'lu', name: '🥟 鲁菜·北方' }, { id: 'regions', name: '🗺️ 各地特色' },
      { id: 'netred', name: '✨ 网红美食' }
    ];
    const MENU_CATALOG = [
      // —— 贵州特色美食 ——
      { c: 'gz', n: '凯里酸汤鱼', s: 3, d: '苗家招牌，红酸汤配嫩鱼，酸辣开胃' },
      { c: 'gz', n: '花溪牛肉粉', s: 1, d: '汤清肉烂，贵阳人的一天从这碗开始' },
      { c: 'gz', n: '遵义羊肉粉', s: 2, d: '羊汤配糊辣椒，冬天一碗浑身暖' },
      { c: 'gz', n: '肠旺面', s: 2, d: '血旺脆臊红油亮，贵阳传统名面' },
      { c: 'gz', n: '贵阳素粉', s: 2, d: '酸粉拌油辣椒，简单却上头' },
      { c: 'gz', n: '酸粉', s: 1, d: '略带酸味的粗米粉，贵州独一份' },
      { c: 'gz', n: '丝娃娃', s: 1, d: '薄饼包素菜丝，蘸酸汤一口一个' },
      { c: 'gz', n: '恋爱豆腐果', s: 2, d: '烤豆腐夹折耳根辣椒水，名字浪漫味道冲' },
      { c: 'gz', n: '豆腐圆子', s: 1, d: '外酥内嫩的炸豆腐丸，雷家最出名' },
      { c: 'gz', n: '贵阳辣子鸡', s: 3, d: '糍粑辣椒炒出来，香辣糯口' },
      { c: 'gz', n: '酸汤牛肉', s: 3, d: '红酸汤涮黄牛肉，酸香浓郁' },
      { c: 'gz', n: '豆米火锅', s: 1, d: '红豆熬汤涮菜，豆香浓稠泡饭一绝' },
      { c: 'gz', n: '酸菜豆米火锅', s: 2, d: '酸菜配豆米，贵州人最日常的火锅' },
      { c: 'gz', n: '糟辣脆皮鱼', s: 2, d: '糟辣椒浇脆皮鱼，酸甜微辣' },
      { c: 'gz', n: '青岩状元蹄', s: 1, d: '卤得软糯的猪脚，青岩古镇招牌' },
      { c: 'gz', n: '青岩鸡辣角', s: 3, d: '辣子鸡丁的青岩版本，越辣越香' },
      { c: 'gz', n: '水城烙锅', s: 2, d: '边烙边蘸辣椒面，洋芋臭豆腐都能烙' },
      { c: 'gz', n: '手撕豆腐', s: 2, d: '炭火烤的豆腐，撕开蘸辣椒水' },
      { c: 'gz', n: '洋芋粑', s: 1, d: '洋芋泥压饼煎到外壳酥脆' },
      { c: 'gz', n: '炸洋芋', s: 2, d: '贵州人的洋芋情结，炸脆拌辣椒面' },
      { c: 'gz', n: '冰浆', s: 0, d: '冰沙加水果糯米，夏天解暑神器' },
      { c: 'gz', n: '杨梅汤', s: 0, d: '酸甜杨梅熬的汤，消暑解腻' },
      { c: 'gz', n: '米豆腐', s: 1, d: '凉拌米豆腐，滑嫩酸辣' },
      { c: 'gz', n: '红油米豆腐', s: 1, d: '红油酸辣浇米豆腐，清爽开胃' },
      { c: 'gz', n: '绿豆粉', s: 1, d: '铜仁绿豆粉，滑溜带豆香' },
      { c: 'gz', n: '铜仁社饭', s: 0, d: '青蒿腊肉糯米香，逢社日才吃的饭' },
      { c: 'gz', n: '贵阳糯米饭', s: 1, d: '油辣椒脆哨折耳根全加上' },
      { c: 'gz', n: '贞丰糯米饭', s: 1, d: '油亮糯米配脆哨，黔西南早点之王' },
      { c: 'gz', n: '破酥包', s: 0, d: '层次分明的软包子，甜咸都好吃' },
      { c: 'gz', n: '糊辣椒蘸水', s: 3, d: '贵州菜的灵魂，什么都想蘸一下' },
      { c: 'gz', n: '牛瘪火锅', s: 3, d: '黔东南勇敢者的美味，草香发酵风味' },
      { c: 'gz', n: '从江香猪', s: 2, d: '皮薄肉嫩，烤或白切都香' },
      { c: 'gz', n: '三穗血浆鸭', s: 3, d: '鸭血入锅的炒鸭，香辣下饭' },
      { c: 'gz', n: '镇远陈年道菜', s: 1, d: '腌了三年的青菜，蒸扣肉一绝' },
      { c: 'gz', n: '安顺裹卷', s: 1, d: '米皮卷蔬菜蘸料，冰凉爽口' },
      { c: 'gz', n: '夺夺粉', s: 2, d: '安顺名小吃，竹签夺着吃的锅' },
      { c: 'gz', n: '镇宁波波糖', s: 0, d: '层层起酥的芝麻糖，落口酥' },
      { c: 'gz', n: '刺梨汁', s: 0, d: '维C之王刺梨榨的汁，酸涩回甘' },
      { c: 'gz', n: '苗家腌鱼', s: 3, d: '糯米腌出来的鱼，酸香发酵风味' },
      { c: 'gz', n: '荔波酸肉', s: 3, d: '发酵酸肉，黔南特色' },
      { c: 'gz', n: '榕江卷粉', s: 1, d: '软滑卷粉配酸汤' },
      { c: 'gz', n: '五色糯米饭', s: 0, d: '布依族植物染色，好看又香' },
      { c: 'gz', n: '打油茶', s: 0, d: '侗族油茶，茶香配米花' },
      { c: 'gz', n: '遵义鸡蛋糕', s: 0, d: '百年老字号，松软香甜' },
      { c: 'gz', n: '黄粑', s: 0, d: '竹叶香糯的黄粑，蒸着吃' },
      { c: 'gz', n: '遵义甜酒酿', s: 0, d: '暖胃微醺，鸡蛋甜酒是标配吃法' },
      { c: 'gz', n: '酸汤砂锅粉', s: 3, d: '酸汤煮的砂锅粉，酸辣烫嘴' },
      { c: 'gz', n: '剪粉', s: 1, d: '剪成段的米皮，拌料开胃' },
      { c: 'gz', n: '贵州烤鱼', s: 2, d: '糊辣椒烤鱼，外焦里嫩' },
      { c: 'gz', n: '红酸汤锅底', s: 3, d: '苗家酸汤锅底，酸得正点' },
      { c: 'gz', n: '遵义虾子羊肉粉', s: 2, d: '遵义虾子镇名吃，粉白汤红，羊肉无膻味' },
      { c: 'gz', n: '贵阳肠旺粉', s: 2, d: '肠旺面的粉版，配脆哨油辣椒更香' },
      { c: 'gz', n: '盘县火腿', s: 1, d: '六盘水盘州特产，陈年发酵咸香回甜' },
      { c: 'gz', n: '威宁荞酥', s: 0, d: '苦荞压制的传统糕点，糖霜夹心' },
      { c: 'gz', n: '织金竹荪炖鸡', s: 1, d: '织金竹荪配土鸡，菌香鸡汤鲜到掉眉毛' },
      { c: 'gz', n: '赫章可乐猪蹄', s: 2, d: '可乐收汁的软糯猪蹄，甜咸微辣' },
      { c: 'gz', n: '六枝岩脚面', s: 1, d: '六枝岩脚镇的手擀细面，筋道带麦香' },
      { c: 'gz', n: '兴义杠子面', s: 1, d: '黔西南杠子面，鸡骨汤配软哨臊子' },
      { c: 'gz', n: '惠水干拌面', s: 2, d: '酸辣油拌细面，糊辣椒是灵魂' },
      { c: 'gz', n: '独山盐酸菜', s: 2, d: '黔南独山盐酸菜，酸脆爽口开胃' },
      { c: 'gz', n: '贵定米粉', s: 1, d: '贵定清汤米粉，讲究清鲜不糊' },
      { c: 'gz', n: '榕江手撕鸭', s: 3, d: '黔东南榕江手撕鸭，糊辣椒鲜香麻辣' },
      { c: 'gz', n: '黔东南酸汤鸡', s: 3, d: '苗家酸汤煮鸡，酸辣鲜香同锅' },
      { c: 'gz', n: '贵州酸汤黄鱼', s: 3, d: '红酸汤煮黄鱼，贵州版酸菜鱼升级版' },
      { c: 'gz', n: '玉屏扣肉', s: 1, d: '玉屏侗族扣肉，糯而不腻咸香下饭' },
      { c: 'gz', n: '贵州油粑粑', s: 1, d: '糯米豆沙油炸粑粑，外脆内糯' },
      { c: 'gz', n: '织金糍粑', s: 0, d: '织金糯米糍粑，蒸熟蘸红糖或黄豆粉' },
      { c: 'gz', n: '晴隆烤豆腐', s: 2, d: '黔西南炭火烤豆腐，撒折耳根辣椒面' },
      { c: 'gz', n: '都匀细粑稀', s: 0, d: '都匀米浆细粑稀，配甜酒汤同吃' },
      { c: 'gz', n: '遵义豆花面', s: 2, d: '遵义豆花面，荤豆花配软哨和油辣椒' },
      // —— 贵州家常菜 ——
      { c: 'gzh', n: '折耳根炒腊肉', s: 3, d: '鱼腥味和腊香的灵魂组合' },
      { c: 'gzh', n: '凉拌折耳根', s: 3, d: '生折耳根拌糊辣椒，外地人不敢夹第二筷' },
      { c: 'gzh', n: '水豆豉拌折耳根', s: 3, d: '豆豉咸香加折耳根，重口下饭' },
      { c: 'gzh', n: '糟辣蛋炒饭', s: 2, d: '糟辣椒炒的蛋炒饭，贵州夜宵标配' },
      { c: 'gzh', n: '糟辣鱼', s: 2, d: '糟辣椒焖鱼，家常酸辣味' },
      { c: 'gzh', n: '糟辣回锅肉', s: 3, d: '糟辣椒版回锅肉，更酸更冲' },
      { c: 'gzh', n: '糍粑辣椒鸡', s: 3, d: '家常版辣子鸡，糯辣入味' },
      { c: 'gzh', n: '酸汤白菜', s: 1, d: '清汤酸白菜，解腻神器' },
      { c: 'gzh', n: '素瓜豆', s: 0, d: '清水煮瓜豆，贵州人上火的救星' },
      { c: 'gzh', n: '豆豉火锅', s: 3, d: '水豆豉打底的家常小火锅' },
      { c: 'gzh', n: '油渣炒白菜', s: 2, d: '猪油渣炒白菜，香得没道理' },
      { c: 'gzh', n: '腊肉炒蒜苔', s: 1, d: '腊肉咸香蒜苔脆' },
      { c: 'gzh', n: '腊肉炒洋芋', s: 2, d: '洋芋腊肉一锅炒' },
      { c: 'gzh', n: '血豆腐炒蒜苗', s: 2, d: '熏香血豆腐配蒜苗' },
      { c: 'gzh', n: '炸酥肉', s: 1, d: '面糊裹五花肉炸到金黄' },
      { c: 'gzh', n: '烧椒皮蛋', s: 2, d: '烧糊的青椒拌皮蛋，下饭神器' },
      { c: 'gzh', n: '泡酸萝卜', s: 1, d: '酸脆萝卜，饭前开胃' },
      { c: 'gzh', n: '酸豆角炒肉末', s: 3, d: '酸脆豆角配肉末' },
      { c: 'gzh', n: '冲菜', s: 3, d: '冲鼻子的芥菜，贵州人就好这口' },
      { c: 'gzh', n: '青椒炒肉', s: 2, d: '贵州家常小炒肉，辣椒多一点' },
      { c: 'gzh', n: '肉末豇豆', s: 2, d: '酸豇豆炒肉末，拌饭拌粉都行' },
      { c: 'gzh', n: '洋芋饭', s: 0, d: '洋芋焖饭，锅巴最香' },
      { c: 'gzh', n: '四季豆焖饭', s: 0, d: '豆香饭香一锅出' },
      { c: 'gzh', n: '糟辣茄盒', s: 2, d: '茄盒酿肉浇糟辣' },
      { c: 'gzh', n: '糊辣椒拌皮蛋', s: 2, d: '糊辣椒一浇，皮蛋也下饭' },
      { c: 'gzh', n: '折耳根炒洋芋', s: 3, d: '洋芋丝配折耳根，贵州人的日常下饭菜' },
      { c: 'gzh', n: '洋芋片炒腊肉', s: 2, d: '腊肉咸香配洋芋片，锅巴最香' },
      { c: 'gzh', n: '糟辣椒炒肉末', s: 3, d: '糟辣椒配肉末，拌饭拌面都香' },
      { c: 'gzh', n: '糟辣椒拌豆腐', s: 2, d: '嫩豆腐浇糟辣椒，一拌就是一碟' },
      { c: 'gzh', n: '折耳根拌豆腐', s: 3, d: '折耳根配豆腐脑，贵州版凉拌组合' },
      { c: 'gzh', n: '水豆豉炒饭', s: 2, d: '水豆豉咸香炒饭，越吃越香' },
      { c: 'gzh', n: '糟辣椒拌皮蛋', s: 2, d: '糟辣椒拌皮蛋，贵州夜宵标配' },
      { c: 'gzh', n: '酸豆角拌折耳根', s: 3, d: '酸豆角配折耳根，重口开胃凉拌' },
      { c: 'gzh', n: '糊辣椒炒洋芋', s: 2, d: '糊辣椒炒洋芋片，越炒越香' },
      { c: 'gzh', n: '酸汤煮豆腐', s: 1, d: '清酸汤煮嫩豆腐，清爽不油腻' },
      { c: 'gzh', n: '洋芋粑炒腊肉', s: 2, d: '洋芋粑切块配腊肉，焦香四溢' },
      { c: 'gzh', n: '折耳根炒肉末', s: 3, d: '肉末炒香下折耳根，梗脆味足' },
      { c: 'gzh', n: '糊辣椒鸡丁', s: 3, d: '糊辣椒爆炒鸡丁，糊香比鲜辣更上头' },
      { c: 'gzh', n: '苦瓜炒腊肉', s: 1, d: '苦瓜回甜搭腊肉咸香，解腻一绝' },
      { c: 'gzh', n: '土豆丝炒折耳根', s: 2, d: '土豆丝爽脆配折耳根，贵州家常标配' },
      // —— 大众家常菜 ——
      { c: 'home', n: '番茄炒蛋', s: 0, d: '国民第一菜，甜咸之争永远不减热度' },
      { c: 'home', n: '酸辣土豆丝', s: 2, d: '脆爽酸辣，下饭界常青树' },
      { c: 'home', n: '青椒肉丝', s: 1, d: '家常小炒的必修课' },
      { c: 'home', n: '鱼香茄子', s: 1, d: '咸甜酸辣，没有鱼也有鱼味' },
      { c: 'home', n: '可乐鸡翅', s: 0, d: '新手必会，甜香软嫩' },
      { c: 'home', n: '糖醋排骨', s: 0, d: '酸甜挂汁，老少通吃' },
      { c: 'home', n: '红烧带鱼', s: 1, d: '咸鲜浓赤，下饭海味' },
      { c: 'home', n: '蒜苔炒肉', s: 1, d: '脆嫩咸香，快手硬菜' },
      { c: 'home', n: '韭菜炒蛋', s: 0, d: '香上加香的三分钟快手菜' },
      { c: 'home', n: '玉米排骨汤', s: 0, d: '清甜炖汤，暖心暖胃' },
      { c: 'home', n: '凉拌黄瓜', s: 1, d: '拍碎更入味，夏天下饭' },
      { c: 'home', n: '皮蛋豆腐', s: 0, d: '嫩豆腐拌皮蛋，浇点生抽就很好' },
      { c: 'home', n: '虎皮青椒', s: 1, d: '青椒煎出虎皮纹，酸甜微辣' },
      { c: 'home', n: '白灼菜心', s: 0, d: '清淡鲜甜，浇豉油就行' },
      { c: 'home', n: '香菇青菜', s: 0, d: '素菜里的干净味道' },
      { c: 'home', n: '木须肉', s: 0, d: '肉片鸡蛋木耳，北京人家的经典' },
      { c: 'home', n: '水蒸蛋', s: 0, d: '滑嫩的鸡蛋羹，一勺一勺停不下来' },
      { c: 'home', n: '土豆炖牛肉', s: 0, d: '炖到软烂，汤汁泡饭' },
      { c: 'home', n: '萝卜炖羊肉', s: 1, d: '冬天炖一锅，汤鲜肉烂' },
      { c: 'home', n: '葱油拌面', s: 0, d: '葱香焦香的最低成本快乐' },
      { c: 'home', n: '蛋炒饭', s: 0, d: '考验功力的基础款' },
      { c: 'home', n: '肉末茄子', s: 2, d: '茄子吸饱肉香，油亮下饭' },
      { c: 'home', n: '红烧豆腐', s: 0, d: '家常烧法，咸鲜入味' },
      { c: 'home', n: '干煸豆角', s: 2, d: '煸出虎皮的豆角，干香有嚼劲' },
      { c: 'home', n: '酸汤肥牛', s: 2, d: '金汤肥牛卷，酸辣开胃' },
      { c: 'home', n: '清炒时蔬', s: 0, d: '当天最嫩的绿叶菜，简单清炒' },
      { c: 'home', n: '手撕包菜', s: 1, d: '手撕的包菜边缘微焦，比刀切更香' },
      { c: 'home', n: '蒜蓉西兰花', s: 0, d: '蒜香清爽，颜色翠绿不发黄' },
      { c: 'home', n: '红烧肉', s: 0, d: '五花肉炖到颤颤巍巍，肥而不腻' },
      { c: 'home', n: '香菇滑鸡', s: 1, d: '香菇吸满鸡汁，嫩滑不柴' },
      { c: 'home', n: '梅菜扣肉', s: 0, d: '梅菜吸肉汁，扣出来颤巍巍' },
      { c: 'home', n: '粉蒸排骨', s: 1, d: '米粉裹排骨蒸得软糯脱骨' },
      { c: 'home', n: '干锅花菜', s: 2, d: '花菜煸到焦香，配肉片更下饭' },
      { c: 'home', n: '蚝油生菜', s: 0, d: '脆生生淋蚝油，两分钟上桌' },
      { c: 'home', n: '韭菜炒豆芽', s: 0, d: '清香爽脆，国民快手小炒' },
      { c: 'home', n: '糖醋里脊', s: 0, d: '外壳酥脆挂汁，酸甜挂得住' },
      { c: 'home', n: '酸辣鸡杂', s: 3, d: '鸡杂爽脆带酸辣，越嚼越香' },
      { c: 'home', n: '冬瓜排骨汤', s: 0, d: '冬瓜清甜排骨浓汤，夏天也喝' },
      // —— 川菜 ——
      { c: 'chuan', n: '麻婆豆腐', s: 3, d: '麻辣烫嫩酥，豆腐界的天花板' },
      { c: 'chuan', n: '回锅肉', s: 2, d: '川菜之王，蒜苗豆瓣是灵魂' },
      { c: 'chuan', n: '宫保鸡丁', s: 2, d: '糊辣荔枝口，花生脆鸡肉嫩' },
      { c: 'chuan', n: '鱼香肉丝', s: 1, d: '泡椒打底的咸甜酸辣' },
      { c: 'chuan', n: '水煮鱼', s: 3, d: '满盆红油辣椒，鱼片滑嫩' },
      { c: 'chuan', n: '水煮牛肉', s: 3, d: '麻辣滚烫，最后那勺热油是精髓' },
      { c: 'chuan', n: '重庆辣子鸡', s: 3, d: '辣椒里找鸡丁，越找越香' },
      { c: 'chuan', n: '酸菜鱼', s: 2, d: '老坛酸菜配鱼片，汤都想喝掉' },
      { c: 'chuan', n: '毛血旺', s: 3, d: '重庆江湖菜大杂烩，血旺毛肚鸭肠' },
      { c: 'chuan', n: '夫妻肺片', s: 2, d: '红油凉拌牛肉牛杂，麻辣鲜香' },
      { c: 'chuan', n: '担担面', s: 2, d: '脆哨芽菜红油，一碗就管饱' },
      { c: 'chuan', n: '钟水饺', s: 1, d: '甜辣红油水饺，成都名点' },
      { c: 'chuan', n: '龙抄手', s: 1, d: '皮薄馅嫩的川式馄饨' },
      { c: 'chuan', n: '钵钵鸡', s: 2, d: '藤椒红油泡串串，冷吃也过瘾' },
      { c: 'chuan', n: '冒菜', s: 3, d: '一个人的火锅，冒什么都好吃' },
      { c: 'chuan', n: '蒜泥白肉', s: 2, d: '薄片五花肉浇蒜泥红油' },
      { c: 'chuan', n: '干煸四季豆', s: 2, d: '煸到起皱，肉末芽菜提香' },
      { c: 'chuan', n: '蚂蚁上树', s: 1, d: '肉末粉丝，下饭快手' },
      { c: 'chuan', n: '粉蒸肉', s: 1, d: '米粉裹五花肉，蒸得酥糯' },
      { c: 'chuan', n: '跷脚牛肉', s: 0, d: '乐山汤锅牛肉，蘸干碟吃' },
      { c: 'chuan', n: '宜宾燃面', s: 2, d: '重油重辣的面条，据说能点燃' },
      { c: 'chuan', n: '重庆小面', s: 3, d: '麻辣鲜香的早餐面，豌杂最经典' },
      { c: 'chuan', n: '乐山甜皮鸭', s: 0, d: '刷糖皮的卤鸭，甜脆咸香' },
      { c: 'chuan', n: '四川火锅', s: 3, d: '牛油锅底，涮什么都是麻辣' },
      { c: 'chuan', n: '口水鸡', s: 2, d: '凉刮嫩鸡浇红油，名字就说明一切' },
      { c: 'chuan', n: '开水白菜', s: 0, d: '看似清水实则醇厚，川菜顶级功夫' },
      { c: 'chuan', n: '樟茶鸭', s: 1, d: '樟木烟熏鸭，蒸出来皮香肉嫩' },
      { c: 'chuan', n: '三大炮', s: 2, d: '糍粑炸脆裹红糖，甜香童年味' },
      { c: 'chuan', n: '甜水面', s: 2, d: '粗面条拌红糖芝麻酱，甜到心里' },
      { c: 'chuan', n: '军屯锅盔', s: 1, d: '成都军屯名点，酥脆掉渣夹肉吃' },
      { c: 'chuan', n: '成都肥肠粉', s: 3, d: '肥肠卤得软糯，粉滑汤红' },
      { c: 'chuan', n: '藤椒鸡', s: 2, d: '藤椒麻香配嫩鸡，清爽麻味' },
      { c: 'chuan', n: '老妈蹄花', s: 2, d: '蹄花炖到糯烂，蘸椒麻碟' },
      // —— 粤菜 ——
      { c: 'yue', n: '白切鸡', s: 0, d: '皮爽肉滑，蘸姜葱蓉见真章' },
      { c: 'yue', n: '广式烧鹅', s: 0, d: '皮脆油香，斩件配酸梅酱' },
      { c: 'yue', n: '蜜汁叉烧', s: 0, d: '半肥瘦的蜜香烤肉' },
      { c: 'yue', n: '虾饺', s: 0, d: '水晶皮包整虾，早茶必点' },
      { c: 'yue', n: '肠粉', s: 0, d: '滑嫩米皮浇豉油，布拉肠最正宗' },
      { c: 'yue', n: '煲仔饭', s: 0, d: '腊味饭底带焦香锅巴' },
      { c: 'yue', n: '云吞面', s: 0, d: '竹升面配鲜虾云吞，汤底大地鱼' },
      { c: 'yue', n: '艇仔粥', s: 0, d: '料足绵滑的广州粥' },
      { c: 'yue', n: '清蒸鲈鱼', s: 0, d: '淋热油豉油，鲜嫩本味' },
      { c: 'yue', n: '白灼虾', s: 0, d: '最简单的鲜甜' },
      { c: 'yue', n: '豉汁蒸排骨', s: 1, d: '早茶笼仔排骨，豉香入味' },
      { c: 'yue', n: '老火靓汤', s: 0, d: '广东人的仪式感，炖足三小时' },
      { c: 'yue', n: '双皮奶', s: 0, d: '两层奶皮，滑嫩奶香' },
      { c: 'yue', n: '杨枝甘露', s: 0, d: '芒果西柚西米露，港式甜品' },
      { c: 'yue', n: '糯米鸡', s: 0, d: '荷叶包糯米鸡肉，蒸出荷香' },
      { c: 'yue', n: '干炒牛河', s: 0, d: '镬气十足，不油不断' },
      { c: 'yue', n: '盐焗鸡', s: 0, d: '盐焗锁汁，皮爽肉滑带咸香' },
      { c: 'yue', n: '客家酿豆腐', s: 1, d: '豆腐挖空酿肉，煎香再焖' },
      { c: 'yue', n: '脆皮烧肉', s: 0, d: '皮烤到爆裂，肥瘦层次分明' },
      { c: 'yue', n: '罗卜焖牛腩', s: 1, d: '白萝卜焖牛腩，浓香带甜' },
      { c: 'yue', n: '沙姜猪手', s: 1, d: '沙姜香气扑鼻，爽脆弹牙' },
      { c: 'yue', n: '干蒸烧卖', s: 0, d: '早茶必点，虾肉顶上一朵黄' },
      { c: 'yue', n: '及第粥', s: 1, d: '粥底绵滑带料，暖胃一绝' },
      { c: 'yue', n: '马拉糕', s: 0, d: '蜂窝气孔，松软带蛋香' },
      // —— 湘菜 ——
      { c: 'xiang', n: '剁椒鱼头', s: 2, d: '红剁椒铺满鱼头，汤拌面条是第二道菜' },
      { c: 'xiang', n: '辣椒炒肉', s: 2, d: '湖南人的一日三餐，螺丝椒带皮炒' },
      { c: 'xiang', n: '小炒黄牛肉', s: 2, d: '嫩牛肉大火爆炒，香辣镬气' },
      { c: 'xiang', n: '口味虾', s: 3, d: '长沙夜宵之王，麻辣小龙虾' },
      { c: 'xiang', n: '常德牛肉粉', s: 1, d: '湘北米粉代表，牛肉码子厚实' },
      { c: 'xiang', n: '长沙臭豆腐', s: 1, d: '黑壳白心，浇汤汁蘸辣椒' },
      { c: 'xiang', n: '糖油粑粑', s: 0, d: '糯米炸糕裹糖浆，长沙街头甜' },
      { c: 'xiang', n: '毛氏红烧肉', s: 0, d: '不放酱油的糖色红烧肉' },
      { c: 'xiang', n: '干锅肥肠', s: 2, d: '处理得干净，越嚼越香' },
      { c: 'xiang', n: '东安鸡', s: 1, d: '湘菜名鸡，酸辣嫩滑' },
      { c: 'xiang', n: '腊味合蒸', s: 1, d: '腊肉腊鱼腊肠一锅蒸，腊香扑鼻' },
      { c: 'xiang', n: '外婆菜炒蛋', s: 1, d: '腌菜炒蛋，拌饭一绝' },
      { c: 'xiang', n: '永州血鸭', s: 2, d: '永州经典，血与鸭同炒香辣' },
      { c: 'xiang', n: '湘西酸肉', s: 3, d: '湘西酸肉，酸辣咸香越嚼越有味' },
      { c: 'xiang', n: '宁乡花猪', s: 1, d: '宁乡花猪肉质细嫩，久炒不柴' },
      { c: 'xiang', n: '湘乡烘鸭', s: 1, d: '湘乡吊炉烘鸭，酱香带焦' },
      { c: 'xiang', n: '湘西酸豆角炒肉末', s: 3, d: '酸豆角配肉末，泡饭一把好手' },
      { c: 'xiang', n: '擂辣椒皮蛋', s: 2, d: '擂碎的烧青椒拌皮蛋，夏日必点' },
      { c: 'xiang', n: '蒜薹腊肉', s: 2, d: '蒜薹脆甜搭腊肉咸香' },
      { c: 'xiang', n: '乡里腊肉炒豆角', s: 3, d: '湘西腊肉炒干豆角，越焖越香' },
      // —— 鲁菜·北方 ——
      { c: 'lu', n: '九转大肠', s: 1, d: '酸甜苦辣咸五味俱全的鲁菜功夫菜' },
      { c: 'lu', n: '糖醋鲤鱼', s: 0, d: '造型跳跃的糖醋浇汁鱼' },
      { c: 'lu', n: '德州扒鸡', s: 0, d: '酥烂脱骨的百年扒鸡' },
      { c: 'lu', n: '葱烧海参', s: 0, d: '大葱浓香衬海参软糯' },
      { c: 'lu', n: '锅包肉', s: 0, d: '东北酸甜酥脆的炸肉片' },
      { c: 'lu', n: '小鸡炖蘑菇', s: 0, d: '榛蘑炖笨鸡，东北炖菜之王' },
      { c: 'lu', n: '猪肉炖粉条', s: 0, d: '东北铁锅的踏实味道' },
      { c: 'lu', n: '地三鲜', s: 0, d: '土豆茄子青椒，过油烧汁' },
      { c: 'lu', n: '铁锅炖大鹅', s: 1, d: '贴饼子炖大鹅，东北硬菜' },
      { c: 'lu', n: '北京烤鸭', s: 0, d: '片皮卷饼，甜面酱葱丝' },
      { c: 'lu', n: '老北京炸酱面', s: 0, d: '六必居酱配菜码' },
      { c: 'lu', n: '铜锅涮羊肉', s: 0, d: '清汤铜锅，麻酱是灵魂' },
      { c: 'lu', n: '煎饼果子', s: 0, d: '天津早点，加两个蛋脆皮多' },
      { c: 'lu', n: '狗不理包子', s: 0, d: '天津名包，水馅半发面' },
      { c: 'lu', n: '胡辣汤', s: 1, d: '河南早点的胡椒浓汤' },
      { c: 'lu', n: '烤冷面', s: 1, d: '东北街头酸甜辣的三层口感' },
      { c: 'lu', n: '葱爆羊肉', s: 1, d: '大葱爆炒羊肉，葱香盖膻' },
      { c: 'lu', n: '扒牛肉', s: 0, d: '鲁菜经典，浓汁大芡裹牛肉' },
      { c: 'lu', n: '熘肝尖', s: 1, d: '滑油爆炒猪肝，嫩到会抖' },
      { c: 'lu', n: '干炸丸子', s: 1, d: '丸子炸到外酥里嫩，蘸椒盐' },
      { c: 'lu', n: '爆炒腰花', s: 2, d: '腰花打花刀，脆嫩弹牙' },
      { c: 'lu', n: '锅塌豆腐', s: 0, d: '豆腐煎后塌软挂汁，金黄微焦' },
      { c: 'lu', n: '单县羊肉汤', s: 1, d: '单县羊汤浓白，羊肉不膻' },
      { c: 'lu', n: '油旋', s: 0, d: '济南油旋层层旋，椒盐夹烧饼' },
      { c: 'lu', n: '甜沫', s: 0, d: '济南甜沫，咸香小米糊带姜味' },
      { c: 'lu', n: '粘豆包', s: 0, d: '黏豆沙糯米皮蒸熟，冬天小吃' },
      { c: 'lu', n: '肉火烧', s: 1, d: '潍坊肉火烧，猪肉大葱馅多汁' },
      // —— 各地特色 ——
      { c: 'regions', n: '兰州牛肉面', s: 1, d: '一清二白三红四绿五黄' },
      { c: 'regions', n: '羊肉泡馍', s: 1, d: '自己掰馍，浓汤泡到入味' },
      { c: 'regions', n: '肉夹馍', s: 0, d: '白吉馍夹腊汁肉，肥而不腻' },
      { c: 'regions', n: '凉皮', s: 1, d: '陕西凉皮浇辣子，酸辣爽滑' },
      { c: 'regions', n: '油泼面', s: 2, d: '一勺热油泼在辣子上，滋啦一声' },
      { c: 'regions', n: '新疆大盘鸡', s: 2, d: '鸡块土豆皮带面，汤汁拌面最香' },
      { c: 'regions', n: '烤羊肉串', s: 1, d: '红柳枝串的孜然羊肉' },
      { c: 'regions', n: '手抓饭', s: 0, d: '羊肉胡萝卜黄萝卜焖饭' },
      { c: 'regions', n: '过桥米线', s: 1, d: '滚汤烫生料，云南仪式感' },
      { c: 'regions', n: '汽锅鸡', s: 0, d: '蒸汽凝汤，鲜美清亮' },
      { c: 'regions', n: '野生菌火锅', s: 1, d: '云南雨季限定，菌子鲜掉眉毛' },
      { c: 'regions', n: '鲜花饼', s: 0, d: '玫瑰花瓣做的酥饼' },
      { c: 'regions', n: '热干面', s: 0, d: '芝麻酱拌碱水面，武汉过早' },
      { c: 'regions', n: '清蒸武昌鱼', s: 0, d: '湖北名鱼，清鲜本味' },
      { c: 'regions', n: '三鲜豆皮', s: 0, d: '武汉过早必备，糯米蛋皮焦香' },
      { c: 'regions', n: '东坡肉', s: 0, d: '黄酒慢炖，酥而不碎' },
      { c: 'regions', n: '西湖醋鱼', s: 0, d: '杭州名鱼，酸甜带蟹味' },
      { c: 'regions', n: '松鼠桂鱼', s: 0, d: '造型松鼠的糖醋炸鱼' },
      { c: 'regions', n: '龙井虾仁', s: 0, d: '茶香入菜，杭帮清雅' },
      { c: 'regions', n: '腌笃鲜', s: 0, d: '春笋咸肉鲜肉同炖，江南春味' },
      { c: 'regions', n: '蟹黄汤包', s: 0, d: '先喝汤再吃皮，小心烫' },
      { c: 'regions', n: '小笼包', s: 0, d: '上海南翔小笼，一口爆汁' },
      { c: 'regions', n: '扬州炒饭', s: 0, d: '颗粒分明的炒饭标准答案' },
      { c: 'regions', n: '红烧狮子头', s: 0, d: '淮扬大肉圆，松而不散' },
      { c: 'regions', n: '佛跳墙', s: 0, d: '闽菜之巅，鲍参翅肚一坛香' },
      { c: 'regions', n: '沙茶面', s: 1, d: '厦门沙茶汤底，料随便加' },
      { c: 'regions', n: '海蛎煎', s: 0, d: '闽南蚵仔煎，蘸甜辣酱' },
      { c: 'regions', n: '生煎包', s: 0, d: '底脆汁多，撒芝麻葱花' },
      { c: 'regions', n: '文昌鸡', s: 0, d: '海南四大名菜之首' },
      { c: 'regions', n: '清补凉', s: 0, d: '海南椰奶甜品，消暑神器' },
      { c: 'regions', n: '桂林米粉', s: 1, d: '卤水米粉，锅烧脆皮加料' },
      { c: 'regions', n: '潮汕牛肉火锅', s: 1, d: '现切黄牛肉，吊龙匙柄分部位涮' },
      { c: 'regions', n: '潮汕生腌', s: 0, d: '海鲜毒药，腌虾蟹冰凉爽鲜' },
      { c: 'regions', n: '南昌瓦罐汤', s: 0, d: '瓦罐煨出来的排骨汤' },
      { c: 'regions', n: '新疆烤全羊', s: 1, d: '整只炭烤，孜然辣椒面撒足' },
      { c: 'regions', n: '新疆烤包子', s: 1, d: '坑烤羊肉包子，皮脆汁多' },
      { c: 'regions', n: '青海手抓羊肉', s: 1, d: '现煮手抓，蘸椒盐原汁原味' },
      { c: 'regions', n: '甘肃洋芋搅团', s: 0, d: '洋芋捣成团，酸汤或辣子拌食' },
      { c: 'regions', n: '兰州酿皮', s: 1, d: '兰州酿皮，麻辣油醋蒜齐上' },
      { c: 'regions', n: '岐山臊子面', s: 2, d: '陕西一绝，酸辣香，捞面要抢' },
      { c: 'regions', n: '宝鸡擀面皮', s: 2, d: '宝鸡面皮薄筋，辣椒油是灵魂' },
      { c: 'regions', n: '宁夏滩羊', s: 1, d: '宁夏盐池滩羊，盐池滩羊无膻' },
      { c: 'regions', n: '内蒙古手把肉', s: 1, d: '只加盐煮的原味手把肉' },
      { c: 'regions', n: '蒙古馅饼', s: 1, d: '草原馅饼，羊肉大葱饼皮酥' },
      { c: 'regions', n: '延吉冷面', s: 2, d: '朝鲜冷面，荞麦面配冷面汤' },
      { c: 'regions', n: '哈尔滨红肠', s: 1, d: '哈尔滨红肠，蒜香熏味十足' },
      { c: 'regions', n: '地锅鸡', s: 2, d: '苏北地锅鸡，锅贴饼子吸汤汁' },
      { c: 'regions', n: '昆明小锅米线', s: 2, d: '小锅现煮，酸辣鲜香一口一口' },
      { c: 'regions', n: '宣威火腿', s: 1, d: '云腿代表，咸香回甜可生食' },
      { c: 'regions', n: '大理乳扇', s: 0, d: '云南乳扇，奶香脆片烤着吃' },
      { c: 'regions', n: '丽江粑粑', s: 1, d: '丽江油炸粑粑，薄脆甜香' },
      { c: 'regions', n: '南宁老友粉', s: 2, d: '南宁老友粉，酸辣臭香够劲' },
      { c: 'regions', n: '玉林牛巴', s: 1, d: '广西玉林牛巴，酱香有嚼劲' },
      // —— 网红美食 ——
      { c: 'netred', n: '柳州螺蛳粉', s: 2, d: '闻着臭吃着香，酸笋是灵魂' },
      { c: 'netred', n: '烤苕皮', s: 2, d: '外焦里糯，包酸萝卜粒刷辣油' },
      { c: 'netred', n: '狼牙土豆', s: 1, d: '波浪土豆条，拌折耳根辣椒面' },
      { c: 'netred', n: '天水麻辣烫', s: 3, d: '甘肃麻辣烫，甘谷辣椒香而不燥' },
      { c: 'netred', n: '淄博小饼烧烤', s: 1, d: '小饼卷串加葱蘸酱，灵魂三件套' },
      { c: 'netred', n: '铁板鱿鱼', s: 1, d: '街边酱香铁板鱿鱼须' },
      { c: 'netred', n: '脆皮五花肉', s: 1, d: '烤到爆皮的五花肉块' },
      { c: 'netred', n: '爆汁烤鸭肠', s: 2, d: '一把一把吃才过瘾' },
      { c: 'netred', n: '炸串', s: 2, d: '刷甜辣酱的裹面炸串' },
      { c: 'netred', n: '锅巴土豆', s: 2, d: '炸到起壳的土豆拌折耳根' },
      { c: 'netred', n: '手搓冰粉', s: 0, d: '红糖山楂花生碎，夏天夜宵搭子' },
      { c: 'netred', n: '手打柠檬茶', s: 0, d: '暴打香水柠檬，酸爽解辣' },
      { c: 'netred', n: '竹筒奶茶', s: 0, d: '网红竹筒奶盖茶' },
      { c: 'netred', n: '烤牛奶', s: 0, d: '外焦里嫩还能拉丝的奶块' },
      { c: 'netred', n: '芝士烤红薯', s: 0, d: '红薯挖空填芝士，拉丝冬天限定' },
      { c: 'netred', n: '芝士玉米粒', s: 0, d: '拉丝芝士裹玉米粒，网红小吃' },
      { c: 'netred', n: '提拉米苏', s: 0, d: '马斯卡彭咖啡酒，手指饼干蘸着吃' },
      { c: 'netred', n: '蛋烘糕', s: 0, d: '成都街头小蛋糕，甜香四溢' },
      { c: 'netred', n: '空气炸锅鸡米花', s: 1, d: '免油鸡米花，外酥里嫩追剧必备' },
      { c: 'netred', n: '炒酸奶', s: 0, d: '酸奶倒盘冷冻，刮成片水果干' },
      { c: 'netred', n: '脏脏包', s: 0, d: '巧克力dirty包，甜到糊嘴' },
      { c: 'netred', n: '铁板牛排', s: 1, d: '滋滋作响铁板牛排，蘸黑椒汁' },
      { c: 'netred', n: '舒芙蕾松饼', s: 0, d: '厚松饼蓬松如云，蜂蜜黄油' },
      { c: 'netred', n: '熔岩芝士鸡排', s: 1, d: '切开流心的芝士鸡排' },
      { c: 'netred', n: '网红芝士焗饭', s: 1, d: '拉丝芝士焗饭，网络爆款' }
    ];
    const state = {
      photos: [], videos: [], photoCapacity: 1000,
      pets: [
        { id: 'cat1', name: '猫猫', kind: 'cat', emoji: '🐱', affinityMale: 30, affinityFemale: 55 },
        { id: 'dog1', name: '狗狗', kind: 'dog', emoji: '🐶', affinityMale: 60, affinityFemale: 20 }
      ],
      profile: null,
      bottles: [], currentBottleId: null, currentPetId: 'cat1',
      menu: { today: [] },
      orders: [],
      room: {
        currentRoom: 'living', currentStyle: 'raw', wallColor: '#e8e0d3', colorTarget: 'backWall', selectedFurnitureIndex: -1,
        mode: 'photo', houseMode: 'villa',
        surfaces: { living: {}, bedroom: {}, bathroom: {} },
        furniture: { living: [], bedroom: [], bathroom: [] },
        photoFurniture: { living: [], bedroom: [], bathroom: [] }, selectedPhotoFurnitureId: null,
        customAssets: { living: [], bedroom: [], bathroom: [] }, customBackgrounds: { living: false, bedroom: false, bathroom: false },
        f3d: { living: [], bedroom: [], bathroom: [] }, f3dStyle: { living: { wall: '#e8e0d3', floor: 'wood', lamp: true }, bedroom: { wall: '#efe6d6', floor: 'wood', lamp: true }, bathroom: { wall: '#dfe3e6', floor: 'tile', lamp: true } },
        wallArts: { living: [], bedroom: [], bathroom: [] }, wallArtWall: 'backWall', selectedWallArtId: null
      }
    };
    const PET_ACTIONS = {
      feed: { base: 5, cooldown: 2000 }, pet: { base: 3, cooldown: 1000 }, play: { base: 4, cooldown: 1500 }
    };
    const cooldowns = new Map();
    let toastTimer = null;
    function toast(message) {
      const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1700);
    }
    function safeParse(key, fallback) {
      try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
      catch (_) { return fallback; }
    }
    function savePets() {
      localStorage.setItem(STORE.pets, JSON.stringify(state.pets.map(p => ({ id: p.id, affinityMale: p.affinityMale, affinityFemale: p.affinityFemale }))));
    }
    function loadPets() {
      let records = safeParse(STORE.pets, null);
      // 兼容旧版 lh_pets_v1 的 aM/aF 字段，避免升级后丢失宠物好感度。
      if (!Array.isArray(records)) {
        const legacy = safeParse('lh_pets_v1', []);
        records = Array.isArray(legacy) ? legacy.map(item => ({ id: item.id, affinityMale: item.aM, affinityFemale: item.aF })) : [];
      }
      records.forEach(record => {
        const pet = state.pets.find(p => p.id === record.id);
        if (pet) {
          if (Number.isFinite(record.affinityMale)) pet.affinityMale = record.affinityMale;
          if (Number.isFinite(record.affinityFemale)) pet.affinityFemale = record.affinityFemale;
        }
      });
    }
    function saveRoom() { localStorage.setItem(STORE.room, JSON.stringify(state.room)); }
    function loadRoom() {
      let saved = safeParse(STORE.room, null);
      if (!saved || typeof saved !== 'object') {
        const legacy = safeParse('lh_room_v1', null);
        if (legacy && typeof legacy === 'object') {
          saved = { currentRoom: legacy.currentRoom, currentStyle: legacy.currentStyle, furniture: { living: [], bedroom: [], bathroom: [] } };
        }
      }
      if (!saved || typeof saved !== 'object') return;
      state.room = { ...state.room, ...saved, furniture: { ...state.room.furniture, ...(saved.furniture || {}) }, surfaces: { ...state.room.surfaces, ...(saved.surfaces || {}) }, wallArts: { ...state.room.wallArts, ...(saved.wallArts || {}) }, photoFurniture: { ...state.room.photoFurniture, ...(saved.photoFurniture || {}) }, customAssets: { ...state.room.customAssets, ...(saved.customAssets || {}) }, customBackgrounds: { ...state.room.customBackgrounds, ...(saved.customBackgrounds || {}) }, f3d: { ...state.room.f3d, ...(saved.f3d || {}) }, f3dStyle: { ...state.room.f3dStyle, ...(saved.f3dStyle || {}) } };
      ['living', 'bedroom', 'bathroom'].forEach(room => {
        if (!Array.isArray(state.room.furniture[room])) state.room.furniture[room] = [];
        if (!Array.isArray(state.room.wallArts[room])) state.room.wallArts[room] = [];
        if (!Array.isArray(state.room.photoFurniture[room])) state.room.photoFurniture[room] = [];
        if (!Array.isArray(state.room.customAssets[room])) state.room.customAssets[room] = [];
        if (!Array.isArray(state.room.f3d[room])) state.room.f3d[room] = [];
        state.room.f3dStyle[room] = { ...state.room.f3dStyle[room], ...((saved.f3dStyle || {})[room] || {}) };
        state.room.surfaces[room] = { ...(state.room.surfaces[room] || {}) };
      });
      state.room.mode = 'photo';
      if (!['backWall', 'sideWall'].includes(state.room.wallArtWall)) state.room.wallArtWall = 'backWall';
      state.room.selectedWallArtId = null;
      state.room.selectedPhotoFurnitureId = null;
      // 兼容早期版本只保存一个墙面颜色的记录。
      if (saved.wallColor && !state.room.surfaces[state.room.currentRoom].backWall) state.room.surfaces[state.room.currentRoom].backWall = saved.wallColor;
      if (!['backWall', 'sideWall', 'floor', 'trim', 'main', 'fabric', 'detail'].includes(state.room.colorTarget)) state.room.colorTarget = 'backWall';
      state.room.selectedFurnitureIndex = -1;
    }
    function saveProfile() { localStorage.setItem(STORE.profile, JSON.stringify(state.profile)); }
    function loadProfile() { state.profile = safeParse(STORE.profile, null); }
    function saveBottles() { localStorage.setItem(STORE.bottles, JSON.stringify(state.bottles)); }
    function loadBottles() {
      const saved = safeParse(STORE.bottles, null);
      if (Array.isArray(saved) && saved.length) state.bottles = saved;
      else {
        state.bottles = Array.from({ length: 7 }, (_, i) => ({ id: `bottle-${i + 1}`, message: '', phase: i / 7, speed: 0.012 + (i % 3) * 0.0015 }));
        saveBottles();
      }
    }

    // -------------------- 账号门：注册 / 登录 / 记住我 / 配对 --------------------
    const AH = window.LoveHouseAccount;
    const accountState = { mode: 'login', pending: null, submitting: false };
    const accountEls = {};
    function accountMsg(text, kind) {
      const el = accountEls.message || document.getElementById('accountMessage');
      if (!el) return;
      el.textContent = text || '';
      el.className = 'account-msg' + (kind ? ' ' + kind : '');
    }
    function setAccountMode(mode) {
      accountState.mode = mode === 'register' ? 'register' : 'login';
      const isRegister = accountState.mode === 'register';
      const loginTab = document.getElementById('accountTabLogin');
      const regTab = document.getElementById('accountTabRegister');
      if (loginTab) loginTab.classList.toggle('active', !isRegister);
      if (regTab) regTab.classList.toggle('active', isRegister);
      const codeField = document.getElementById('accountCodeField');
      if (codeField) codeField.style.display = isRegister ? 'block' : 'none';
      const submit = document.getElementById('accountSubmit');
      if (submit) submit.textContent = isRegister ? '创建账号并进入' : '登录小屋';
      const pwd = document.getElementById('accountPassword');
      if (pwd) pwd.setAttribute('autocomplete', isRegister ? 'new-password' : 'current-password');
      const sw = document.getElementById('accountSwitch');
      if (sw) sw.innerHTML = isRegister
        ? '已经有账号了？<button type="button" id="accountGoLogin">直接登录</button>'
        : '还没有账号？<button type="button" id="accountGoRegister">创建一个</button>';
      const goLogin = document.getElementById('accountGoLogin');
      const goRegister = document.getElementById('accountGoRegister');
      if (goLogin) goLogin.addEventListener('click', () => setAccountMode('login'));
      if (goRegister) goRegister.addEventListener('click', () => setAccountMode('register'));
      accountMsg('');
    }
    function showAccountGate(show) {
      const gate = document.getElementById('accountGate');
      if (!gate) return;
      gate.classList.toggle('active', Boolean(show));
      document.body.classList.toggle('account-locked', Boolean(show));
    }
    function fillAccountForm() {
      const saved = AH ? AH.loadSaved() : null;
      const email = document.getElementById('accountEmail');
      const pwd = document.getElementById('accountPassword');
      const remember = document.getElementById('accountRemember');
      if (saved) {
        if (email) email.value = saved.email || '';
        if (remember) remember.checked = saved.remember !== false;
        if (pwd && saved.password) pwd.value = saved.password;
      } else if (remember) {
        remember.checked = true;
      }
    }
    async function submitAccount() {
      if (accountState.submitting) return;
      const email = (document.getElementById('accountEmail')?.value || '').trim();
      const password = document.getElementById('accountPassword')?.value || '';
      const code = (document.getElementById('accountCode')?.value || '').trim();
      const remember = document.getElementById('accountRemember')?.checked;
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return accountMsg('请填写正确的邮箱地址', 'err');
      if (!password || password.length < 6) return accountMsg('密码至少 6 位', 'err');
      if (!AH) return accountMsg('账号服务未加载，请刷新页面重试', 'err');
      const submit = document.getElementById('accountSubmit');
      accountState.submitting = true;
      if (submit) { submit.disabled = true; submit.textContent = accountState.mode === 'register' ? '正在创建账号…' : '正在登录…'; }
      try {
        if (accountState.mode === 'register') {
          if (!code) throw new Error('请先填写邮箱验证码');
          const session = await AH.register(email, password, code);
          AH.saveAccount(email, password, remember);
          await AH.account.account ? null : null;
          await applyAccountSession(session);
        } else {
          const session = await AH.login(email, password);
          AH.saveAccount(email, password, remember);
          await applyAccountSession(session);
        }
        accountMsg('欢迎回来～', 'ok');
        showAccountGate(false);
      } catch (error) {
        const msg = error && error.message ? error.message : '操作失败，请稍后重试';
        accountMsg(msg, 'err');
      } finally {
        accountState.submitting = false;
        if (submit) {
          submit.disabled = false;
          submit.textContent = accountState.mode === 'register' ? '创建账号并进入' : '登录小屋';
        }
      }
    }
    async function applyAccountSession(session) {
      if (!AH) return;
      // account.js 内部 afterAuth 会拉取资料；这里手动走一遍以拿到 profile
      const acc = AH.account;
      acc.user = {
        id: (session && session.user && session.user.id) || '',
        name: (session && session.user && session.user.name) || (session && session.user && session.user.email) || '',
        email: (session && session.user && session.user.email) || ''
      };
      const row = await AH.fetchProfile(acc.user.id).catch(() => null);
      let profile = row;
      if (!profile) {
        profile = await AH.upsertProfile(acc.user.id, {
          nickname: acc.user.name,
          gender: state.profile && state.profile.gender ? state.profile.gender : 'male',
          pair_code: AH.randomPairCode()
        }).catch(() => null);
      } else if (!profile.pair_code) {
        profile = await AH.upsertProfile(acc.user.id, { pair_code: AH.randomPairCode() }).catch(() => profile);
      }
      acc.profile = profile;
      acc.pairCode = (profile && profile.pair_code) || '';
      acc.online = true;
      // 本机角色与云端角色同步：以云端为准
      if (profile && profile.gender) {
        state.profile = { name: profile.nickname || acc.user.name, gender: profile.gender };
        saveProfile();
      } else if (profile) {
        await AH.setProfile({ gender: state.profile?.gender || 'male', nickname: state.profile?.name || acc.user.name }).catch(() => {});
      }
      updateProfileUI();
      updateSettingsAccountUI();
      await syncOrdersFromCloud();
      startOrderSync();
    }
    function updateSettingsAccountUI() {
      const acc = AH ? AH.account : null;
      const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
      setText('settingsAccount', acc && acc.user ? (acc.user.email || acc.user.name || '已登录') : '未登录');
      setText('settingsAccountRole', acc && acc.profile && acc.profile.gender
        ? (acc.profile.gender === 'female' ? '女生' : '男生') : '未设置');
      setText('settingsSyncState', acc && acc.online ? (acc.pairCode ? '已连接（已配对）' : '已连接（待配对）') : '离线');
      const codeEl = document.getElementById('pairCodeValue');
      if (codeEl) codeEl.textContent = acc && acc.pairCode ? acc.pairCode : '------';
    }
    document.getElementById('accountTabLogin')?.addEventListener('click', () => setAccountMode('login'));
    document.getElementById('accountTabRegister')?.addEventListener('click', () => setAccountMode('register'));
    document.getElementById('accountSubmit')?.addEventListener('click', submitAccount);
    document.getElementById('accountSendCode')?.addEventListener('click', async () => {
      const email = (document.getElementById('accountEmail')?.value || '').trim();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return accountMsg('请先填写正确的邮箱地址', 'err');
      const btn = document.getElementById('accountSendCode');
      if (btn) { btn.disabled = true; btn.textContent = '发送中…'; }
      try {
        await AH.sendRegisterCode(email);
        accountMsg('验证码已发到邮箱，查收后再点「创建账号并进入」', 'ok');
        if (btn) { btn.textContent = '已发送'; setTimeout(() => { btn.disabled = false; btn.textContent = '重新获取'; }, 45000); }
      } catch (error) {
        accountMsg(error && error.message ? error.message : '验证码发送失败', 'err');
        if (btn) { btn.disabled = false; btn.textContent = '获取验证码'; }
      }
    });
    document.getElementById('accountOfflineBtn')?.addEventListener('click', () => {
      showAccountGate(false);
      if (!state.profile || !state.profile.name) showProfileGate(true);
      else toast('已进入离线模式，订单会先存在本机 💕');
    });
    document.getElementById('accountPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') submitAccount(); });
    document.getElementById('accountCode')?.addEventListener('keydown', e => { if (e.key === 'Enter') submitAccount(); });
    document.getElementById('pairCodeCopy')?.addEventListener('click', () => {
      const acc = AH ? AH.account : null;
      if (!acc || !acc.pairCode) return toast('还没有配对码');
      const text = acc.pairCode;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast('配对码已复制，发给 TA 吧')).catch(() => toast(`配对码：${text}`));
      else toast(`配对码：${text}`);
    });
    document.getElementById('pairCodeNew')?.addEventListener('click', async () => {
      if (!AH) return;
      try {
        const code = await AH.unpair();
        toast(`新的配对码：${code}`);
        updateSettingsAccountUI();
      } catch (error) { toast(error.message || '操作失败'); }
    });
    document.getElementById('pairCodeJoin')?.addEventListener('click', async () => {
      if (!AH) return;
      const input = document.getElementById('pairCodeInput');
      const code = (input?.value || '').trim();
      if (!code) return toast('请输入 TA 的配对码');
      try {
        await AH.pairWith(code);
        toast('配对成功！订单现在实时共享 💕');
        if (input) input.value = '';
        updateSettingsAccountUI();
        await syncOrdersFromCloud();
      } catch (error) { toast(error && error.message ? error.message : '配对失败'); }
    });
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      if (!AH) return;
      await AH.logout();
      showAccountGate(true);
      setAccountMode('login');
      updateSettingsAccountUI();
      toast('已退出登录');
    });

    // -------------------- 点菜菜单：浏览 / 搜索 / 下单 / 双方共享订单 --------------------
    const STORE_ORDERS = 'love_house_orders_v1';
    const ORDER_STATUS = {
      placed: { label: '待下厨', cls: 'placed', next: 'cooking', nextLabel: '🍳 开始做菜' },
      cooking: { label: '制作中', cls: 'cooking', next: 'done', nextLabel: '🍽 做好啦' },
      done: { label: '已上桌', cls: 'done', next: '', nextLabel: '' }
    };
    const ORDER_STATUS_RANK = { placed: 0, cooking: 1, done: 2 };

    function saveMenu() { localStorage.setItem(STORE.menu, JSON.stringify(state.menu)); }
    function loadMenu() {
      const saved = safeParse(STORE.menu, null);
      if (saved && Array.isArray(saved.today)) {
        const local = Array.isArray(state.menu.today) ? state.menu.today : [];
        state.menu.today = Array.from(new Set(local.concat(saved.today.filter(id => typeof id === 'string'))));
      }
    }
    function saveOrders() {
      try { localStorage.setItem(STORE_ORDERS, JSON.stringify(state.orders)); } catch (_) {}
    }
    function loadOrders() {
      const saved = safeParse(STORE_ORDERS, []);
      state.orders = Array.isArray(saved) ? saved.filter(o => o && o.id && Array.isArray(o.dishes)) : [];
    }
    // 合并两份订单列表（按 id 去重，状态取更靠后的那个），保证双方下单不会互相覆盖
    function mergeOrders(base, incoming) {
      const map = new Map();
      (base || []).forEach(order => { if (order && order.id) map.set(order.id, order); });
      (incoming || []).forEach(order => {
        if (!order || !order.id) return;
        const old = map.get(order.id);
        if (!old) { map.set(order.id, order); return; }
        const newer = (Number(order.at) || 0) >= (Number(old.at) || 0) ? order : old;
        const rank = Math.max(ORDER_STATUS_RANK[order.status] ?? 0, ORDER_STATUS_RANK[old.status] ?? 0);
        const status = Object.keys(ORDER_STATUS_RANK).find(key => ORDER_STATUS_RANK[key] === rank) || 'placed';
        map.set(order.id, { ...old, ...newer, status });
      });
      return Array.from(map.values()).sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
    }
    function nextOrderNo() {
      let max = 0;
      state.orders.forEach(order => {
        const matched = String(order.no || '').match(/(\d+)\s*$/);
        if (matched) max = Math.max(max, Number(matched[1]));
      });
      return '#' + String(max + 1).padStart(4, '0');
    }
    function formatOrderTime(ts) {
      const date = new Date(Number(ts) || Date.now());
      const pad = n => String(n).padStart(2, '0');
      const today = new Date();
      const sameDay = date.toDateString() === today.toDateString();
      return sameDay
        ? `今天 ${pad(date.getHours())}:${pad(date.getMinutes())}`
        : `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    function isMyOrder(order) {
      if (!order || !order.by || !state.profile) return false;
      return order.by.name === state.profile.name && order.by.gender === state.profile.gender;
    }
    // 当前视角：绑定为女生 → 只看简要做法；绑定为男生 → 看完整详细做法
    function viewerIsFemale() { return Boolean(state.profile && state.profile.gender === 'female'); }
    function viewerName() { return (state.profile && state.profile.name) || '我'; }

    const menuUi = { cat: 'today', query: '' };
    const MENU_REGION_NAMES = { gz: '贵州', gzh: '贵州', home: '家常', chuan: '川', yue: '粤', xiang: '湘', lu: '北方', regions: '各地', netred: '网红' };
    function menuSpicyHtml(s) { return s ? `<span class="m-spicy">${'🌶️'.repeat(s)}</span>` : '<span class="m-spicy" style="opacity:.55">不辣</span>'; }
    function menuCatCount(catId) {
      if (catId === 'today') return state.menu.today.length;
      if (catId === 'orders') return state.orders.length;
      return MENU_CATALOG.filter(item => item.c === catId).length;
    }
    // 分类：只有「今天想吃」「我们的订单」两枚常驻按钮，其余全部收进一个下拉选择器
    function renderMenuTabs() {
      const select = document.getElementById('menuCatSelect');
      const todayBtn = document.getElementById('menuTabToday');
      const ordersBtn = document.getElementById('menuTabOrders');
      const todayBadge = document.getElementById('menuBadgeToday');
      const ordersBadge = document.getElementById('menuBadgeOrders');
      if (todayBadge) todayBadge.textContent = String(menuCatCount('today'));
      if (ordersBadge) ordersBadge.textContent = String(menuCatCount('orders'));
      if (todayBtn) todayBtn.classList.toggle('active', menuUi.cat === 'today');
      if (ordersBtn) ordersBtn.classList.toggle('active', menuUi.cat === 'orders');
      if (!select) return;
      const cuisineCats = MENU_CATS.filter(cat => cat.id !== 'today' && cat.id !== 'orders');
      select.innerHTML = '';
      cuisineCats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.name}（${menuCatCount(cat.id)} 道）`;
        select.appendChild(opt);
      });
      // 当前选中的是 today / orders 时，下拉框回落到第一个菜系上并显示提示
      const activeCat = cuisineCats.find(cat => cat.id === menuUi.cat);
      select.value = activeCat ? activeCat.id : (cuisineCats[0] ? cuisineCats[0].id : '');
      select.dataset.mode = activeCat ? 'cat' : 'special';
    }
    function switchMenuCat(catId) {
      menuUi.cat = catId;
      menuUi.query = '';
      const search = document.getElementById('menuSearch');
      if (search) search.value = '';
      renderMenuPanel();
    }
    function menuFilteredItems() {
      const query = menuUi.query.trim().toLowerCase();
      if (query) {
        // 搜索跨全分类（菜名 / 简介 / 用料 / 做法步骤）
        return MENU_CATALOG.filter(item => menuMatch(item, query));
      }
      if (!menuUi.cat) return MENU_CATALOG.slice();
      if (menuUi.cat === 'today') return MENU_CATALOG.filter(item => state.menu.today.includes(item.n));
      return MENU_CATALOG.filter(item => item.c === menuUi.cat);
    }
    // 搜索除了菜名与简介，还匹配用料表（例如搜"折耳根"能找到所有用它做主料的菜）
    function menuMatch(item, query) {
      if (item.n.toLowerCase().includes(query) || item.d.toLowerCase().includes(query)) return true;
      const recipe = MENU_RECIPES[item.n];
      if (!recipe) return false;
      if ((recipe.ing || []).some(ing => String(ing.n || '').toLowerCase().includes(query))) return true;
      if ((recipe.steps || []).some(s => s.toLowerCase().includes(query))) return true;
      return false;
    }
    function renderMenuPanel() {
      renderMenuTabs();
      const showOrders = menuUi.cat === 'orders';
      const query = menuUi.query.trim();
      const searchRow = document.getElementById('menuSearchRow');
      const searchAllRow = document.getElementById('menuSearchAllRow');
      searchRow.style.display = showOrders ? 'none' : 'flex';
      searchAllRow.style.display = (!showOrders && query && menuUi.cat) ? 'flex' : 'none';
      document.getElementById('menuGrid').style.display = showOrders ? 'none' : 'grid';
      document.getElementById('orderView').hidden = !showOrders;
      if (showOrders) { renderOrderList(); renderMenuBar(); return; }
      const grid = document.getElementById('menuGrid');
      const items = menuFilteredItems();
      const allText = document.getElementById('menuSearchAllText');
      if (allText) allText.textContent = query;
      document.getElementById('menuCountLabel').textContent = query ? `${items.length} 道（全部分类搜索）` : `${items.length} 道`;
      grid.innerHTML = '';
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'hint'; empty.style.gridColumn = '1/-1'; empty.style.textAlign = 'center';
        empty.textContent = !menuUi.cat ? '没有找到这道菜，换个名字试试？'
          : menuUi.cat === 'today' ? '还没点菜，去上面的菜系下拉里逛逛，看馋了就点一份～'
          : '没有找到这道菜，换个名字试试？';
        grid.appendChild(empty);
      }
      items.forEach(item => {
        const picked = state.menu.today.includes(item.n);
        const card = document.createElement('div');
        card.className = 'menu-card' + (picked ? ' picked' : '');
        card.innerHTML = `
          <div class="m-name">${item.n}<span class="m-region">${MENU_REGION_NAMES[item.c] || ''}</span></div>
          ${menuSpicyHtml(item.s)}
          <div class="m-desc">${item.d}</div>
          <div class="m-actions">
            <button class="m-recipe" type="button">📖 看做法</button>
            <button class="m-video" type="button">🎬 教学</button>
            <button class="m-pick" type="button">${picked ? '✅ 已点 · 取消' : '＋ 点这道'}</button>
          </div>`;
        card.querySelector('.m-pick').addEventListener('click', () => toggleMenuToday(item.n));
        card.querySelector('.m-recipe').addEventListener('click', () => openRecipe(item.n));
        card.querySelector('.m-video').addEventListener('click', () => openRecipe(item.n, { video: true }));
        grid.appendChild(card);
      });
      renderMenuBar();
    }
    function renderMenuBar() {
      const today = state.menu.today;
      const label = document.getElementById('menuBarLabel');
      const meta = document.getElementById('menuBarMeta');
      const checkout = document.getElementById('menuCheckoutBtn');
      const clear = document.getElementById('menuBarClear');
      if (menuUi.cat === 'orders') {
        label.textContent = `🧾 我们的订单（${state.orders.length} 单）`;
        meta.textContent = state.orders.length ? '谁下的单都能看到，做菜进度也会同步 💕' : '还没有订单，去挑几道菜吧～';
        checkout.style.display = 'none'; clear.style.display = 'none';
        return;
      }
      checkout.style.display = ''; clear.style.display = '';
      label.textContent = today.length
        ? `❤️ 今天想吃（${today.length}）：${today.slice(0, 3).join('、')}${today.length > 3 ? ` 等 ${today.length} 道` : ''}`
        : '还没有点菜，逛逛看想吃啥～';
      meta.textContent = today.length ? '点「去下单」，TA 那边也会看到 💌' : '点「去下单」，双方都能看到 💕';
      // 不再禁用按钮：空购物车时点击给出明确提示，避免"点了没反应"
      checkout.classList.toggle('is-empty', !today.length);
      checkout.textContent = today.length ? `去下单（${today.length}）` : '去下单';
    }
    function toggleMenuToday(name) {
      const index = state.menu.today.indexOf(name);
      if (index >= 0) { state.menu.today.splice(index, 1); toast(`已把「${name}」从今天想吃里移除`); }
      else { state.menu.today.push(name); toast(`「${name}」已加入今天想吃 🍽️`); }
      saveMenu(); renderMenuPanel();
    }
    document.getElementById('menuTabToday').addEventListener('click', () => switchMenuCat('today'));
    document.getElementById('menuTabOrders').addEventListener('click', () => switchMenuCat('orders'));
    document.getElementById('menuCatSelect').addEventListener('change', event => {
      switchMenuCat(event.target.value);
    });
    document.getElementById('menuSearch').addEventListener('input', event => {
      menuUi.query = event.target.value;
      renderMenuPanel();
    });
    document.getElementById('menuSearchAllBtn').addEventListener('click', () => {
      const q = menuUi.query.trim();
      if (!q) return;
      // 在全部菜系中检索：临时把 cat 置空，匹配逻辑已支持跨分类搜索
      menuUi.cat = '';
      renderMenuPanel();
      toast(`已在全部菜系中搜索「${q}」`);
    });
    document.getElementById('menuBarClear').addEventListener('click', () => {
      if (!state.menu.today.length) return;
      state.menu.today = []; saveMenu(); renderMenuPanel(); toast('已清空今天想吃的菜单');
    });
    document.getElementById('menuCheckoutBtn').addEventListener('click', () => {
      if (!state.menu.today.length) {
        toast('还没有点菜哦～先在上面的菜系下拉里挑几道吧 🍽️');
        const select = document.getElementById('menuCatSelect');
        if (select) select.focus();
        return;
      }
      openCheckoutDialog();
    });
    document.getElementById('menuBtn').addEventListener('click', () => openPanel('panel-menu'));

    // -------------------- 订单：确认下单 / 双方共享列表 --------------------
    const checkoutForm = { servings: 2, note: '' };
    function openCheckoutDialog() {
      const dishes = state.menu.today.slice();
      if (!dishes.length) { toast('先选几道菜吧～'); return; }
      checkoutForm.servings = 2; checkoutForm.note = '';
      const role = state.profile ? `${state.profile.name}（${state.profile.gender === 'female' ? '女生' : '男生'}）` : '还没绑定角色';
      const box = document.getElementById('orderDialogInner');
      box.innerHTML = `
        <h3 class="order-form-title">🧾 确认下单</h3>
        <p class="order-form-sub">下单后 TA 那边也会收到，谁下的单双方都看得见 💕</p>
        <div class="order-who-line">下单人：${escapeHtml(role)}</div>
        <div class="order-form-dishes">${dishes.map(name => `<span>${escapeHtml(name)}</span>`).join('')}</div>
        <div class="order-field">
          <label>👥 份量</label>
          <div class="order-scale-row" id="checkoutScale">
            ${[1, 2, 3, 4].map(n => `<button type="button" data-servings="${n}" class="${n === 2 ? 'active' : ''}">${n} 人份</button>`).join('')}
          </div>
        </div>
        <div class="order-field">
          <label>💌 想对 TA 说的话（选填）</label>
          <textarea class="text-area" id="checkoutNote" placeholder="例如：不要香菜，多放辣一点～"></textarea>
        </div>
        <div class="row">
          <button class="btn" type="button" id="checkoutConfirm">确认下单</button>
          <button class="btn secondary" type="button" id="checkoutCancel">再看看</button>
        </div>`;
      box.querySelectorAll('[data-servings]').forEach(btn => btn.addEventListener('click', () => {
        checkoutForm.servings = Number(btn.dataset.servings);
        box.querySelectorAll('[data-servings]').forEach(item => item.classList.toggle('active', item === btn));
      }));
      box.querySelector('#checkoutNote').addEventListener('input', event => { checkoutForm.note = event.target.value; });
      box.querySelector('#checkoutConfirm').addEventListener('click', () => submitOrder());
      box.querySelector('#checkoutCancel').addEventListener('click', () => closeOrderDialog());
      document.getElementById('orderDialog').classList.add('active');
      document.getElementById('orderBackdrop').classList.add('active');
      syncPanelOpen();
    }
    function closeOrderDialog() {
      document.getElementById('orderDialog').classList.remove('active');
      document.getElementById('orderBackdrop').classList.remove('active');
      syncPanelOpen();
    }
    async function submitOrder() {
      const dishes = state.menu.today.slice();
      if (!dishes.length) return toast('先选几道菜吧～');
      const order = {
        id: 'ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
        no: nextOrderNo(),
        dishes,
        by: { name: viewerName(), gender: state.profile && state.profile.gender ? state.profile.gender : 'male' },
        at: Date.now(),
        servings: checkoutForm.servings,
        note: (checkoutForm.note || '').trim(),
        status: 'placed'
      };
      state.orders = mergeOrders(state.orders, [order]);
      saveOrders(); updateMenuButton();
      // 优先写入云端（配对码相同的双方都能看到）；不可用时退回 Java 后端
      const cloudSaved = await pushOrderToCloud(order);
      if (!cloudSaved) {
        const synced = await postServerOrder(order);
        if (synced) { state.orders = mergeOrders(state.orders, synced); saveOrders(); }
      }
      state.menu.today = []; saveMenu();
      closeOrderDialog();
      menuUi.cat = 'orders';
      renderMenuPanel();
      toast('下单成功！TA 那边也能看到啦 💕');
    }
    function renderOrderList() {
      const list = document.getElementById('orderList');
      const orders = state.orders;
      const acc = AH ? AH.account : null;
      const syncLabel = document.getElementById('orderSyncLabel');
      if (syncLabel) {
        if (acc && acc.online && acc.pairCode) {
          syncLabel.innerHTML = `🔗 已配对（配对码 ${acc.pairCode}）：谁下的单对方都能实时看见 💕`;
        } else if (acc && acc.online) {
          syncLabel.innerHTML = '🔑 还没和 TA 配对：点「🔑 我的配对码」把码发给 TA，或让 TA 在设置里填你的码 💕';
        } else {
          syncLabel.innerHTML = '📴 当前离线：订单只存在本机，联网并配对后自动同步 💕';
        }
      }
      if (!orders.length) {
        list.innerHTML = `<div class="order-empty">
          <img src="assets/wall_stickers/kuromi/kuromi_02.png" alt="" />
          <div>还没有订单呢～<br>去「❤️ 今天想吃」挑几道菜，下单后 TA 也能看见 💕</div>
        </div>`;
        return;
      }
      list.innerHTML = '';
      orders.forEach(order => {
        const by = order.by || { name: 'TA', gender: 'male' };
        const female = by.gender === 'female';
        const status = ORDER_STATUS[order.status] || ORDER_STATUS.placed;
        const card = document.createElement('div');
        card.className = 'order-card' + (isMyOrder(order) ? ' mine' : '');
        card.innerHTML = `
          <div class="order-card-top">
            <span class="order-avatar ${female ? 'female' : 'male'}">${female ? '🎀' : '🖤'}</span>
            <div class="order-who">
              <b>${escapeHtml(by.name || 'TA')}</b>
              <span>${escapeHtml(formatOrderTime(order.at))} · ${Number(order.servings) || 2} 人份 · ${escapeHtml(status.label)}</span>
            </div>
            <span class="order-status ${status.cls}">${escapeHtml(status.label)}</span>
          </div>
          <div class="order-no">订单号 ${escapeHtml(order.no || '')}${isMyOrder(order) ? ' · 我点的' : ' · TA 点的'}</div>
          <div class="order-dishes">
            ${(order.dishes || []).map(name => `<button type="button" class="order-dish" data-dish="${escapeHtml(name)}">🍽 ${escapeHtml(name)}<em>看做法</em></button>`).join('')}
          </div>
          ${order.note ? `<div class="order-note">💌 ${escapeHtml(order.note)}</div>` : ''}
          <div class="order-foot">
            ${status.next ? `<button type="button" data-action="advance">${escapeHtml(status.nextLabel)}</button>` : ''}
            <button type="button" data-action="again">🔁 再点一次</button>
            <button type="button" data-action="share">🔗 发给 TA</button>
            <button type="button" class="danger" data-action="delete">🗑 删除</button>
          </div>`;
        card.querySelectorAll('.order-dish').forEach(btn => btn.addEventListener('click', () => openRecipe(btn.dataset.dish, { order })));
        card.querySelector('[data-action="advance"]')?.addEventListener('click', () => advanceOrder(order));
        card.querySelector('[data-action="again"]').addEventListener('click', () => reorderDishes(order));
        card.querySelector('[data-action="share"]').addEventListener('click', () => openShareDialog([order]));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => removeOrder(order));
        list.appendChild(card);
      });
    }
    async function advanceOrder(order) {
      const current = ORDER_STATUS[order.status] || ORDER_STATUS.placed;
      if (!current.next) return;
      order.status = current.next;
      state.orders = mergeOrders(state.orders, [order]);
      saveOrders(); renderOrderList();
      const cloudSaved = await pushOrderToCloud(order);
      if (!cloudSaved) {
        const synced = await patchServerOrder(order.id, { status: current.next });
        if (synced) { state.orders = mergeOrders(state.orders, synced); saveOrders(); renderOrderList(); }
      }
      toast(current.next === 'cooking' ? '已开始做菜，TA 那边同步看到 🍳' : '做好啦，快去吃吧 🍽');
    }
    function reorderDishes(order) {
      (order.dishes || []).forEach(name => { if (!state.menu.today.includes(name)) state.menu.today.push(name); });
      saveMenu(); menuUi.cat = 'today'; renderMenuPanel();
      toast('已把菜品放回「今天想吃」，可以直接下单 💕');
    }
    async function removeOrder(order) {
      state.orders = state.orders.filter(item => item.id !== order.id);
      saveOrders(); renderOrderList(); updateMenuButton();
      const cloudRemoved = await removeOrderFromCloud(order.id);
      if (!cloudRemoved) await deleteServerOrder(order.id);
      toast('订单已删除');
    }
    function updateMenuButton() {
      const btn = document.getElementById('menuBtn');
      if (!btn) return;
      const pending = state.orders.filter(order => (order.status || 'placed') !== 'done').length;
      btn.textContent = pending ? `🍜 点菜 ·${pending}` : '🍜 点菜';
    }

    // -------------------- 订单同步：服务端模式自动同步，静态站用同步码 / 链接 --------------------
    function serverModeOn() { return Boolean(window.__SERVER_MODE__); }
    async function fetchServerOrders() {
      if (!serverModeOn()) return null;
      try {
        const res = await fetch('/api/orders', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return null;
        const list = await res.json();
        return Array.isArray(list) ? list : null;
      } catch (_) { return null; }
    }
    async function postServerOrder(order) {
      if (!serverModeOn() || !order) return null;
      try {
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
        if (!res.ok) return null;
        const list = await res.json();
        return Array.isArray(list) ? list : null;
      } catch (_) { return null; }
    }
    async function patchServerOrder(id, patch) {
      if (!serverModeOn() || !id) return null;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch || {}) });
        if (!res.ok) return null;
        const list = await res.json();
        return Array.isArray(list) ? list : null;
      } catch (_) { return null; }
    }
    async function deleteServerOrder(id) {
      if (!serverModeOn() || !id) return null;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) return null;
        const list = await res.json();
        return Array.isArray(list) ? list : null;
      } catch (_) { return null; }
    }
    async function refreshOrders() {
      const list = await fetchServerOrders();
      if (!list) return;
      const merged = mergeOrders(state.orders, list);
      if (JSON.stringify(merged) !== JSON.stringify(state.orders)) {
        state.orders = merged; saveOrders(); updateMenuButton();
        if (document.getElementById('panel-menu').classList.contains('active')) renderMenuPanel();
      }
    }
    function startOrderSync() {
      if (!serverModeOn()) return;
      setInterval(() => { if (!document.hidden) refreshOrders(); }, 15000);
      window.addEventListener('focus', () => refreshOrders());
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshOrders(); });
    }
    function encodeOrdersPayload(orders) {
      const compact = (orders || []).map(order => ({
        id: order.id, no: order.no || '', d: Array.isArray(order.dishes) ? order.dishes : [],
        b: order.by ? [order.by.name || '', order.by.gender || 'male'] : null,
        t: Number(order.at) || 0, s: order.status || 'placed', n: order.note || '', p: Number(order.servings) || 2
      }));
      const bytes = new TextEncoder().encode(JSON.stringify(compact));
      let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte); });
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function decodeOrdersPayload(code) {
      try {
        let raw = String(code || '').trim();
        if (!raw) return [];
        const hashIndex = raw.indexOf('#order=');
        if (hashIndex >= 0) raw = raw.slice(hashIndex + 7);
        raw = raw.split('#')[0].split('&')[0].trim();
        if (!raw) return [];
        const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
        const parsed = JSON.parse(new TextDecoder().decode(bytes));
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(order => order && order.id).map(order => ({
          id: order.id, no: order.no || '', dishes: Array.isArray(order.d) ? order.d : [],
          by: order.b ? { name: order.b[0] || 'TA', gender: order.b[1] || 'male' } : null,
          at: Number(order.t) || Date.now(), status: order.s || 'placed', note: order.n || '', servings: Number(order.p) || 2
        }));
      } catch (error) { console.warn('订单同步码解析失败：', error); return []; }
    }
    function buildShareLink(orders) {
      const base = location.origin + location.pathname + (location.search || '');
      return `${base}#order=${encodeOrdersPayload(orders)}`;
    }
    async function copyText(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; }
      } catch (_) {}
      try {
        const area = document.createElement('textarea');
        area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.appendChild(area); area.select();
        const done = document.execCommand('copy');
        document.body.removeChild(area);
        return done;
      } catch (_) { return false; }
    }
    function openShareDialog(orders) {
      const list = orders && orders.length ? orders : state.orders;
      if (!list.length) return toast('还没有订单可以分享～');
      document.getElementById('orderShareLink').value = buildShareLink(list);
      document.getElementById('orderShareDialog').classList.add('active');
      document.getElementById('orderShareBackdrop').classList.add('active');
      syncPanelOpen();
    }
    function closeShareDialog() {
      document.getElementById('orderShareDialog').classList.remove('active');
      document.getElementById('orderShareBackdrop').classList.remove('active');
      syncPanelOpen();
    }
    function openImportDialog() {
      document.getElementById('orderImportDialog').classList.add('active');
      document.getElementById('orderImportBackdrop').classList.add('active');
      syncPanelOpen();
    }
    function closeImportDialog() {
      document.getElementById('orderImportDialog').classList.remove('active');
      document.getElementById('orderImportBackdrop').classList.remove('active');
      syncPanelOpen();
    }
    document.getElementById('orderPairBtn').addEventListener('click', () => {
      const acc = AH ? AH.account : null;
      if (!acc || !acc.pairCode) {
        toast('还没有配对码，先登录账号吧');
        return;
      }
      const code = acc.pairCode;
      copyText(code).then(ok => {
        toast(ok ? `配对码 ${code} 已复制，发给 TA 吧 🔑` : `配对码：${code}`);
      });
    });
    document.getElementById('orderShareBtn').addEventListener('click', () => openShareDialog(state.orders));
    document.getElementById('orderImportBtn').addEventListener('click', () => openImportDialog());
    document.getElementById('orderShareCopy').addEventListener('click', async () => {
      const ok = await copyText(document.getElementById('orderShareLink').value);
      toast(ok ? '链接已复制，发给 TA 吧 🔗' : '复制失败，请长按上方文字手动复制');
    });
    document.getElementById('orderShareCode').addEventListener('click', async () => {
      const code = document.getElementById('orderShareLink').value.split('#order=')[1] || '';
      const ok = await copyText(code);
      toast(ok ? '同步码已复制 🔑' : '复制失败，请长按手动复制');
    });
    document.getElementById('orderImportConfirm').addEventListener('click', () => {
      const incoming = decodeOrdersPayload(document.getElementById('orderImportText').value);
      if (!incoming.length) return toast('没看懂这个同步码，检查一下有没有复制完整～');
      state.orders = mergeOrders(state.orders, incoming);
      saveOrders(); updateMenuButton(); closeImportDialog(); renderMenuPanel();
      toast(`已导入 ${incoming.length} 单订单 💕`);
    });
    document.getElementById('orderImportCancel').addEventListener('click', () => closeImportDialog());
    document.getElementById('orderBackdrop').addEventListener('click', () => closeOrderDialog());
    document.getElementById('orderShareBackdrop').addEventListener('click', () => closeShareDialog());
    document.getElementById('orderImportBackdrop').addEventListener('click', () => closeImportDialog());
    function handleIncomingOrderLink() {
      const hash = location.hash || '';
      if (hash.indexOf('#order=') < 0) return;
      const incoming = decodeOrdersPayload(hash);
      if (incoming.length) {
        state.orders = mergeOrders(state.orders, incoming);
        saveOrders(); updateMenuButton();
        toast(`收到 TA 的 ${incoming.length} 单订单，已并入「我们的订单」💕`);
      }
      try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
    }

    // -------------------- 菜谱详情：用料用量 / 正宗步骤 / 用量增减影响 --------------------
    const MENU_RECIPES = window.MENU_RECIPES || {};
    const RECIPE_SCALES = [1, 2, 3, 4];
    let recipeScale = 2;
    function escapeHtml(text) {
      return String(text == null ? '' : text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    // 把"加到X会…；减到Y则…"这类说明里强调的关键数字高亮出来
    function highlightAdjust(text) {
      const safe = escapeHtml(text);
      return safe.replace(/([^；。，,；]{0,12})(加到|减到|增加到|减至|减半|翻倍|加至)([^；。，,；]{0,24})/g,
        (m, pre, op, post) => `${pre}<b>${op}${post}</b>`);
    }
    // 用量换算：区分"整件食材"与"可按比例缩放的量"
    //  · "1条约800g" → 4人份时为 "2条约1600g"（件数取整，重量同比）
    //  · "400g" "3勺" "2瓣" → 直接按倍数缩放
    function scaleQuantity(text, factor) {
      if (!text || factor === 1) return text;
      const unitRe = /(\d+(?:\.\d+)?)\s*(g|克|kg|千克|ml|毫升|L|升|勺|茶匙|汤匙|个|只|条|块|片|根|瓣|颗|粒|朵|张|碗|把|段)/g;
      const pieceRe = /(\d+(?:\.\d+)?)\s*(条|只|整只|整条)\s*(约?\s*\d+(?:\.\d+)?\s*(?:g|克|kg|千克|斤))/g;
      const scaled = num => {
        const value = parseFloat(num) * factor;
        return value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
      };
      // 比例（3:1、1/4）不参与换算，先替换成标记
      const ratios = [];
      let src = String(text).replace(/\d+\s*[:：]\s*\d+|\d+\s*\/\s*\d+/g, m2 => {
        ratios.push(m2);
        return `@@R${ratios.length - 1}@@`;
      });
      // 整件食材（1条约800g）件数与重量分别换算
      const pieces = [];
      src = src.replace(pieceRe, (m2, cnt, piece, weight) => {
        const n = Math.max(1, Math.round(parseFloat(cnt) * factor));
        const wm = weight.match(/(\d+(?:\.\d+)?)/);
        const weightText = wm ? weight.replace(/\d+(?:\.\d+)?/, String(Math.round(parseFloat(wm[1]) * factor))) : weight;
        pieces.push(`${n}${piece}${weightText}`);
        return `@@P${pieces.length - 1}@@`;
      });
      // 其余计量单位按倍数缩放
      src = src.replace(unitRe, (m2, num, unit) => `${scaled(num)}${unit}`);
      // 还原标记
      src = src.replace(/@@P(\d+)@@/g, (m2, i) => pieces[Number(i)]);
      src = src.replace(/@@R(\d+)@@/g, (m2, i) => ratios[Number(i)]);
      return src;
    }
    // 把长步骤压缩成一句话要点（女生视角的简要做法）
    function briefStep(text) {
      const raw = String(text || '').trim();
      if (!raw) return '';
      const first = raw.split(/[。；;!！]/)[0] || raw;
      const short = first.replace(/^\d+\s*[、.．)）]\s*/, '').trim();
      return short.length > 32 ? short.slice(0, 32) + '…' : short;
    }
    // -------------------- 菜谱视频教学 --------------------
    // 每道菜给出可播放的教学入口：
    //  1) 菜谱自带视频地址（assets 目录下的 mp4 / 外链）时直接内嵌播放；
    //  2) 没有自带视频时，提供多个教学视频平台的搜索直达（无需联网也能点开搜索页）；
    //  3) 用户也可以把本地视频绑定到这道菜（存在 IndexedDB），随时回看。
    const RECIPE_VIDEO_SITES = [
      { name: '哔哩哔哩', url: q => `https://search.bilibili.com/all?keyword=${encodeURIComponent(q + ' 做法')}` },
      { name: '抖音', url: q => `https://www.douyin.com/search/${encodeURIComponent(q + ' 做法')}` },
      { name: 'YouTube', url: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' recipe')}` }
    ];
    function recipeVideoKey(name) { return 'love_house_recipe_video_v1:' + name; }
    function getBoundRecipeVideo(name) {
      try { return JSON.parse(localStorage.getItem(recipeVideoKey(name)) || 'null'); }
      catch (e) { return null; }
    }
    function setBoundRecipeVideo(name, info) {
      try {
        if (info) localStorage.setItem(recipeVideoKey(name), JSON.stringify(info));
        else localStorage.removeItem(recipeVideoKey(name));
      } catch (e) {}
    }
    function isEmbeddedVideoUrl(url) {
      if (!url) return false;
      return /^https?:\/\/(.*\.)?(bilibili\.com|b23\.tv|douyin\.com|iesdouyin\.com|youku\.com|iqiyi\.com|qq\.com|youTube\.com|youtu\.be)\//i.test(url)
        || /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url);
    }
    function renderRecipeVideoBox(name, ctx) {
      const bound = getBoundRecipeVideo(name);
      const recipe = MENU_RECIPES[name] || {};
      const inline = recipe.video || bound?.url || '';
      const showFrame = isEmbeddedVideoUrl(inline);
      const searchLinks = RECIPE_VIDEO_SITES.map(site =>
        `<button type="button" data-site="${site.name}" data-url="${site.url(name)}">🔍 ${site.name}搜「${escapeHtml(name)}」</button>`
      ).join('');
      return `
        <div class="recipe-video-box">
          <div class="recipe-video-head"><img src="assets/wall_stickers/kuromi/kuromi_05.png" alt="" /><span>🎬 视频教学 · ${escapeHtml(name)}</span></div>
          <div class="recipe-video-actions">
            ${searchLinks}
            <button type="button" id="recipeVideoUpload">＋ 绑定本地教学视频</button>
            ${bound ? '<button type="button" id="recipeVideoUnbind">🗑 取消绑定</button>' : ''}
          </div>
          ${showFrame ? `<div class="recipe-video-frame">${/\.(mp4|webm|ogg)(\?|$)/i.test(inline) ? `<video src="${escapeHtml(inline)}" controls playsinline preload="metadata"></video>` : `<iframe src="${escapeHtml(inline)}" allowfullscreen scrolling="no" frameborder="0" referrerpolicy="no-referrer"></iframe>`}</div>` : ''}
          <p class="recipe-video-hint">${bound ? '已绑定你自己的教学视频，点上面的搜索按钮也能看别人的做法。' : '没有内置视频也没关系：点上面的按钮直接跳到教学平台搜这道菜；也可以上传一段本地教学视频绑在这道菜上，随时回看。'}</p>
        </div>`;
    }
    function bindRecipeVideo(name, ctx) {
      const box = document.getElementById('recipeInner');
      if (!box) return;
      box.querySelectorAll('.recipe-video-actions button[data-site]').forEach(btn => {
        btn.addEventListener('click', () => window.open(btn.dataset.url, '_blank', 'noopener'));
      });
      const uploadBtn = document.getElementById('recipeVideoUpload');
      if (uploadBtn) uploadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'video/*';
        input.addEventListener('change', async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setBoundRecipeVideo(name, { url: url, name: file.name, at: Date.now(), local: true });
          toast(`已把这段视频绑定到「${name}」`);
          renderRecipeBody(name, ctx);
        });
        input.click();
      });
      const unbind = document.getElementById('recipeVideoUnbind');
      if (unbind) unbind.addEventListener('click', () => {
        const bound = getBoundRecipeVideo(name);
        if (bound && bound.local && bound.url && bound.url.startsWith('blob:')) URL.revokeObjectURL(bound.url);
        setBoundRecipeVideo(name, null);
        toast('已取消绑定');
        renderRecipeBody(name, ctx);
      });
    }
    function renderRecipeBody(name, ctx) {
      const context = ctx || {};
      const box = document.getElementById('recipeInner');
      const female = viewerIsFemale();
      const order = context.order || null;
      const recipe = MENU_RECIPES[name];
      const orderLine = order
        ? `<div class="recipe-order-note">📋 来自订单 ${escapeHtml(order.no || '')} · ${escapeHtml((order.by && order.by.name) || 'TA')} 点的${Number(order.servings) > 2 ? `（${Number(order.servings)} 人份）` : ''}</div>`
        : '';
      if (!recipe) {
        box.innerHTML = `<div class="recipe-none">这道菜的详细做法还在整理中～<br>先点「＋ 点这道」把它加进今天想吃吧 🍽️</div>
          <div class="recipe-foot"><button class="btn" type="button" id="recipeFallbackPick">＋ 加入今天想吃</button></div>`;
        const fb = document.getElementById('recipeFallbackPick');
        if (fb) fb.addEventListener('click', () => { toggleMenuToday(name); closeRecipe(); });
        return;
      }
      const factor = recipeScale / 2;   // 菜谱默认按 2 人份给出
      const scaleBtns = RECIPE_SCALES.map(n => `<button type="button" class="${recipeScale === n ? 'active' : ''}" data-scale="${n}">${n} 人份</button>`).join('');
      const meta = `
        ${recipe.time ? `<span>⏱ ${escapeHtml(recipe.time)}</span>` : ''}
        ${recipe.level ? `<span>🎯 ${escapeHtml(recipe.level)}</span>` : ''}
        ${recipe.servings ? `<span>🍚 ${escapeHtml(recipe.servings)}</span>` : ''}`;
      const roleTip = female
        ? `<div class="recipe-role-tip female">
             <img src="assets/wall_stickers/hello_kitty/hello_kitty_02.png" alt="" />
             <span>你绑定的是<b>女生角色</b>，这里显示<b>简要做法</b>；精确用量、加减量影响和关键窍门属于完整版，由男生那边查看 💕</span>
           </div>`
        : `<div class="recipe-role-tip male">
             <img src="assets/wall_stickers/kuromi/kuromi_03.png" alt="" />
             <span>你绑定的是<b>男生角色</b>，这里显示<b>完整详细做法</b>：精确用量、加多/加少的影响与关键窍门都在这儿 👨‍🍳</span>
           </div>`;
      const head = `
        <div class="recipe-head">
          <h3>${escapeHtml(name)}</h3>
          <div class="recipe-meta">${meta}</div>
          ${female ? '' : `<div class="recipe-scale" role="group" aria-label="份量换算">
            <span>👥 换算份量</span>${scaleBtns}
            <em>（用料按 2 人份为基准自动换算，下方"加多/加少"为该基准下的参考值）</em>
          </div>`}
        </div>`;
      const foot = `
        <div class="recipe-foot">
          <button class="btn" type="button" id="recipePickBtn">${state.menu.today.includes(name) ? '✅ 已点 · 取消' : '＋ 加入今天想吃'}</button>
          ${order ? `<button class="btn soft" type="button" id="recipeOrderAgain">🔁 再点一次这道</button>` : ''}
          <button class="btn secondary" type="button" id="recipeCloseBtn">返回菜单</button>
        </div>`;
      const videoBox = renderRecipeVideoBox(name, context);
      let body = '';
      if (female) {
        // 女生视角：简要做法（食材清单 + 要点步骤），不展示精确用量、增减说明与完整步骤
        const simpleIngs = (recipe.ing || []).map(item => `<span>${escapeHtml(item.n)}</span>`).join('');
        const briefSteps = (recipe.steps || []).map(briefStep).filter(Boolean);
        body = `
          ${simpleIngs ? `<div class="recipe-sec-title">🧺 需要哪些食材</div><div class="recipe-ing-simple">${simpleIngs}</div>` : ''}
          ${briefSteps.length ? `<div class="recipe-sec-title">👩‍🍳 简要做法</div><ol class="recipe-brief-steps">${briefSteps.map((step, i) => `<li><i>${i + 1}</i><span>${escapeHtml(step)}</span></li>`).join('')}</ol>` : ''}
          <div class="recipe-lock">🔒 精确用量、加多/加少的影响与关键窍门属于「完整做法」，留给男生那边查看；想吃什么直接点「＋ 加入今天想吃」告诉 TA 吧 💕</div>`;
      } else {
        // 男生视角：完整详细做法（精确用量 + 加减量影响 + 全部步骤 + 窍门）
        const ings = (recipe.ing || []).map(item => `
          <div class="recipe-ing">
            <div class="recipe-ing-top">
              <span class="recipe-ing-name">${escapeHtml(item.n)}</span>
              <span class="recipe-ing-qty">${escapeHtml(factor === 1 ? item.q : scaleQuantity(item.q, factor))}</span>
            </div>
            ${item.a ? `<div class="recipe-ing-note">${highlightAdjust(factor === 1 ? item.a : scaleQuantity(item.a, factor))}</div>` : ''}
          </div>`).join('');
        const steps = (recipe.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
        body = `
          ${ings ? `<div class="recipe-sec-title">🧺 用料与用量</div><div class="recipe-ing-list">${ings}</div>` : ''}
          ${steps ? `<div class="recipe-sec-title">👩‍🍳 做法步骤</div><ol class="recipe-steps">${steps}</ol>` : ''}
          ${recipe.key ? `<div class="recipe-sec-title">🔑 关键窍门</div><div class="recipe-key">${escapeHtml(recipe.key)}</div>` : ''}
          ${recipe.tip ? `<div class="recipe-sec-title">💡 用量微调建议</div><div class="recipe-tip">${escapeHtml(recipe.tip)}</div>` : ''}`;
      }
      box.innerHTML = `${roleTip}${orderLine}${head}${body}${videoBox}${foot}`;
      bindRecipeVideo(name, context);
      box.querySelectorAll('[data-scale]').forEach(btn => btn.addEventListener('click', () => {
        recipeScale = Number(btn.dataset.scale);
        renderRecipeBody(name, context);
      }));
      document.getElementById('recipePickBtn').addEventListener('click', () => {
        toggleMenuToday(name);
        renderRecipeBody(name, context);
      });
      document.getElementById('recipeOrderAgain')?.addEventListener('click', () => {
        if (!state.menu.today.includes(name)) state.menu.today.push(name);
        saveMenu(); toast(`已把「${name}」放回今天想吃`);
      });
      document.getElementById('recipeCloseBtn').addEventListener('click', () => closeRecipe());
    }
    function openRecipe(name, ctx) {
      renderRecipeBody(name, ctx);
      document.getElementById('recipeDialog').classList.add('active');
      document.getElementById('recipeBackdrop').classList.add('active');
      syncPanelOpen();
      const inner = document.getElementById('recipeInner');
      if (inner) inner.scrollTop = 0;
    }
    function closeRecipe() {
      document.getElementById('recipeDialog').classList.remove('active');
      document.getElementById('recipeBackdrop').classList.remove('active');
      syncPanelOpen();
    }

    // -------------------- 媒体存储：IndexedDB 优先，受限环境自动降级到压缩本地存储 --------------------
    const DB_NAME = 'love-house-db', DB_VERSION = 3;
    const MEDIA_STORES = ['photos','videos','wallArt','roomAssets','roomBgs'];
    const fallbackKey = store => `love_house_media_${store}`;
    const memStores = Object.fromEntries(MEDIA_STORES.map(name => [name, new Map()]));
    let db = null;
    let mediaFallback = false;

    function blobToDataUrl(blob, maxSide = 1100, quality = .74) {
      return new Promise(resolve => {
        if (!blob) return resolve(null);
        const url = URL.createObjectURL(blob), img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
          canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          try { resolve(canvas.toDataURL('image/jpeg', quality)); } catch (_) { resolve(null); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
      });
    }
    async function persistFallbackStore(store) {
      if (!mediaFallback) return;
      const records = [];
      for (const record of (memStores[store] || new Map()).values()) {
        const copy = { ...record };
        if (copy.blob && /^image\//i.test(copy.blob.type)) {
          copy.dataUrl = copy.dataUrl || await blobToDataUrl(copy.blob);
          delete copy.blob;
        } else if (copy.blob) {
          copy.sessionOnly = true; delete copy.blob;
        }
        records.push(copy);
      }
      try { localStorage.setItem(fallbackKey(store), JSON.stringify(records)); }
      catch (error) { console.warn('媒体压缩保存失败：', error); }
    }
    function restoreFallbackStores() {
      MEDIA_STORES.forEach(store => {
        try {
          const raw = localStorage.getItem(fallbackKey(store)); if (!raw) return;
          JSON.parse(raw).forEach(record => { if (record && record.id) memStores[store].set(record.id, record); });
        } catch (error) { console.warn('媒体恢复失败：', store, error); }
      });
    }
    function openDB() {
      return new Promise(resolve => {
        if (!window.indexedDB) { mediaFallback = true; resolve(false); return; }
        let request;
        try { request = indexedDB.open(DB_NAME, DB_VERSION); }
        catch (_) { mediaFallback = true; resolve(false); return; }
        request.onupgradeneeded = event => {
          const database = event.target.result;
          MEDIA_STORES.forEach(name => { if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath: 'id' }); });
        };
        request.onsuccess = event => { db = event.target.result; mediaFallback = false; resolve(true); };
        request.onerror = () => { mediaFallback = true; resolve(false); };
        request.onblocked = () => { mediaFallback = true; resolve(false); };
      });
    }
    function dbRequest(store, mode, action, value) {
      return new Promise((resolve, reject) => {
        if (!db) {
          const map = memStores[store] || (memStores[store] = new Map());
          if (action === 'getAll') resolve([...map.values()]);
          else if (action === 'put') { map.set(value.id, value); persistFallbackStore(store); resolve(value.id); }
          else if (action === 'clear') { map.clear(); persistFallbackStore(store); resolve(); }
          else if (action === 'delete') { map.delete(value); persistFallbackStore(store); resolve(); }
          else resolve();
          return;
        }
        try {
          const tx = db.transaction(store, mode), objectStore = tx.objectStore(store);
          const request = action === 'getAll' ? objectStore.getAll() : action === 'put' ? objectStore.put(value) : action === 'clear' ? objectStore.clear() : objectStore.delete(value);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } catch (error) { reject(error); }
      });
    }
    function mediaUrl(record) { return record && (record.dataUrl || (record.blob ? URL.createObjectURL(record.blob) : '')); }
    async function loadMedia() {
      const photoRecords = await dbRequest('photos', 'readonly', 'getAll');
      const videoRecords = await dbRequest('videos', 'readonly', 'getAll');
      state.photos = photoRecords.sort((a, b) => a.createdAt - b.createdAt)
        .map(item => ({ id: item.id, name: item.name, url: mediaUrl(item) }))
        .filter(item => item.url);
      state.videos = videoRecords.sort((a, b) => a.createdAt - b.createdAt)
        .map(item => ({ id: item.id, name: item.name, url: mediaUrl(item), blob: item.blob || null, dataUrl: item.dataUrl || null, createdAt: item.createdAt }))
        .filter(item => item.url);
    }
    const wallArtAssets = new Map();
    const wallArtTextures = new Map();
    const wallArtMeshes = new Map();
    const STICKER_CATALOG = {"hello_kitty":[{"path":"assets/wall_stickers/hello_kitty_sheet.png","name":"Hello Kitty 粉色甜美 · 整组贴纸","sheet":true},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_01.png","name":"Hello Kitty 粉色甜美 · 贴纸 01","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_02.png","name":"Hello Kitty 粉色甜美 · 贴纸 02","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_03.png","name":"Hello Kitty 粉色甜美 · 贴纸 03","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_04.png","name":"Hello Kitty 粉色甜美 · 贴纸 04","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_05.png","name":"Hello Kitty 粉色甜美 · 贴纸 05","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_06.png","name":"Hello Kitty 粉色甜美 · 贴纸 06","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_07.png","name":"Hello Kitty 粉色甜美 · 贴纸 07","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_08.png","name":"Hello Kitty 粉色甜美 · 贴纸 08","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_09.png","name":"Hello Kitty 粉色甜美 · 贴纸 09","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_10.png","name":"Hello Kitty 粉色甜美 · 贴纸 10","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_11.png","name":"Hello Kitty 粉色甜美 · 贴纸 11","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_12.png","name":"Hello Kitty 粉色甜美 · 贴纸 12","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_13.png","name":"Hello Kitty 粉色甜美 · 贴纸 13","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_14.png","name":"Hello Kitty 粉色甜美 · 贴纸 14","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_15.png","name":"Hello Kitty 粉色甜美 · 贴纸 15","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_16.png","name":"Hello Kitty 粉色甜美 · 贴纸 16","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_17.png","name":"Hello Kitty 粉色甜美 · 贴纸 17","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_18.png","name":"Hello Kitty 粉色甜美 · 贴纸 18","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_19.png","name":"Hello Kitty 粉色甜美 · 贴纸 19","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_20.png","name":"Hello Kitty 粉色甜美 · 贴纸 20","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_21.png","name":"Hello Kitty 粉色甜美 · 贴纸 21","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_22.png","name":"Hello Kitty 粉色甜美 · 贴纸 22","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_23.png","name":"Hello Kitty 粉色甜美 · 贴纸 23","sheet":false},{"path":"assets/wall_stickers/hello_kitty/hello_kitty_24.png","name":"Hello Kitty 粉色甜美 · 贴纸 24","sheet":false}],"kuromi":[{"path":"assets/wall_stickers/kuromi_sheet.png","name":"库洛米 紫黑甜酷 · 整组贴纸","sheet":true},{"path":"assets/wall_stickers/kuromi/kuromi_01.png","name":"库洛米 紫黑甜酷 · 贴纸 01","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_02.png","name":"库洛米 紫黑甜酷 · 贴纸 02","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_03.png","name":"库洛米 紫黑甜酷 · 贴纸 03","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_04.png","name":"库洛米 紫黑甜酷 · 贴纸 04","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_05.png","name":"库洛米 紫黑甜酷 · 贴纸 05","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_06.png","name":"库洛米 紫黑甜酷 · 贴纸 06","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_07.png","name":"库洛米 紫黑甜酷 · 贴纸 07","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_08.png","name":"库洛米 紫黑甜酷 · 贴纸 08","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_09.png","name":"库洛米 紫黑甜酷 · 贴纸 09","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_10.png","name":"库洛米 紫黑甜酷 · 贴纸 10","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_11.png","name":"库洛米 紫黑甜酷 · 贴纸 11","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_12.png","name":"库洛米 紫黑甜酷 · 贴纸 12","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_13.png","name":"库洛米 紫黑甜酷 · 贴纸 13","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_14.png","name":"库洛米 紫黑甜酷 · 贴纸 14","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_15.png","name":"库洛米 紫黑甜酷 · 贴纸 15","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_16.png","name":"库洛米 紫黑甜酷 · 贴纸 16","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_17.png","name":"库洛米 紫黑甜酷 · 贴纸 17","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_18.png","name":"库洛米 紫黑甜酷 · 贴纸 18","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_19.png","name":"库洛米 紫黑甜酷 · 贴纸 19","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_20.png","name":"库洛米 紫黑甜酷 · 贴纸 20","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_21.png","name":"库洛米 紫黑甜酷 · 贴纸 21","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_22.png","name":"库洛米 紫黑甜酷 · 贴纸 22","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_23.png","name":"库洛米 紫黑甜酷 · 贴纸 23","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_24.png","name":"库洛米 紫黑甜酷 · 贴纸 24","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_25.png","name":"库洛米 紫黑甜酷 · 贴纸 25","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_26.png","name":"库洛米 紫黑甜酷 · 贴纸 26","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_27.png","name":"库洛米 紫黑甜酷 · 贴纸 27","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_28.png","name":"库洛米 紫黑甜酷 · 贴纸 28","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_29.png","name":"库洛米 紫黑甜酷 · 贴纸 29","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_30.png","name":"库洛米 紫黑甜酷 · 贴纸 30","sheet":false},{"path":"assets/wall_stickers/kuromi/kuromi_31.png","name":"库洛米 紫黑甜酷 · 贴纸 31","sheet":false}],"cinnamoroll":[{"path":"assets/wall_stickers/cinnamoroll_sheet.png","name":"玉桂狗 天空云朵 · 整组贴纸","sheet":true},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_01.png","name":"玉桂狗 天空云朵 · 贴纸 01","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_02.png","name":"玉桂狗 天空云朵 · 贴纸 02","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_03.png","name":"玉桂狗 天空云朵 · 贴纸 03","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_04.png","name":"玉桂狗 天空云朵 · 贴纸 04","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_05.png","name":"玉桂狗 天空云朵 · 贴纸 05","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_06.png","name":"玉桂狗 天空云朵 · 贴纸 06","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_07.png","name":"玉桂狗 天空云朵 · 贴纸 07","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_08.png","name":"玉桂狗 天空云朵 · 贴纸 08","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_09.png","name":"玉桂狗 天空云朵 · 贴纸 09","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_10.png","name":"玉桂狗 天空云朵 · 贴纸 10","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_11.png","name":"玉桂狗 天空云朵 · 贴纸 11","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_12.png","name":"玉桂狗 天空云朵 · 贴纸 12","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_13.png","name":"玉桂狗 天空云朵 · 贴纸 13","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_14.png","name":"玉桂狗 天空云朵 · 贴纸 14","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_15.png","name":"玉桂狗 天空云朵 · 贴纸 15","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_16.png","name":"玉桂狗 天空云朵 · 贴纸 16","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_17.png","name":"玉桂狗 天空云朵 · 贴纸 17","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_18.png","name":"玉桂狗 天空云朵 · 贴纸 18","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_19.png","name":"玉桂狗 天空云朵 · 贴纸 19","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_20.png","name":"玉桂狗 天空云朵 · 贴纸 20","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_21.png","name":"玉桂狗 天空云朵 · 贴纸 21","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_22.png","name":"玉桂狗 天空云朵 · 贴纸 22","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_23.png","name":"玉桂狗 天空云朵 · 贴纸 23","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_24.png","name":"玉桂狗 天空云朵 · 贴纸 24","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_25.png","name":"玉桂狗 天空云朵 · 贴纸 25","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_26.png","name":"玉桂狗 天空云朵 · 贴纸 26","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_27.png","name":"玉桂狗 天空云朵 · 贴纸 27","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_28.png","name":"玉桂狗 天空云朵 · 贴纸 28","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_29.png","name":"玉桂狗 天空云朵 · 贴纸 29","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_30.png","name":"玉桂狗 天空云朵 · 贴纸 30","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_31.png","name":"玉桂狗 天空云朵 · 贴纸 31","sheet":false},{"path":"assets/wall_stickers/cinnamoroll/cinnamoroll_32.png","name":"玉桂狗 天空云朵 · 贴纸 32","sheet":false}],"hangyodon":[{"path":"assets/wall_stickers/hangyodon_sheet.png","name":"人鱼汉顿 海洋蓝 · 整组贴纸","sheet":true},{"path":"assets/wall_stickers/hangyodon/hangyodon_01.png","name":"人鱼汉顿 海洋蓝 · 贴纸 01","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_02.png","name":"人鱼汉顿 海洋蓝 · 贴纸 02","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_03.png","name":"人鱼汉顿 海洋蓝 · 贴纸 03","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_04.png","name":"人鱼汉顿 海洋蓝 · 贴纸 04","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_05.png","name":"人鱼汉顿 海洋蓝 · 贴纸 05","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_06.png","name":"人鱼汉顿 海洋蓝 · 贴纸 06","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_07.png","name":"人鱼汉顿 海洋蓝 · 贴纸 07","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_08.png","name":"人鱼汉顿 海洋蓝 · 贴纸 08","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_09.png","name":"人鱼汉顿 海洋蓝 · 贴纸 09","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_10.png","name":"人鱼汉顿 海洋蓝 · 贴纸 10","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_11.png","name":"人鱼汉顿 海洋蓝 · 贴纸 11","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_12.png","name":"人鱼汉顿 海洋蓝 · 贴纸 12","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_13.png","name":"人鱼汉顿 海洋蓝 · 贴纸 13","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_14.png","name":"人鱼汉顿 海洋蓝 · 贴纸 14","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_15.png","name":"人鱼汉顿 海洋蓝 · 贴纸 15","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_16.png","name":"人鱼汉顿 海洋蓝 · 贴纸 16","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_17.png","name":"人鱼汉顿 海洋蓝 · 贴纸 17","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_18.png","name":"人鱼汉顿 海洋蓝 · 贴纸 18","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_19.png","name":"人鱼汉顿 海洋蓝 · 贴纸 19","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_20.png","name":"人鱼汉顿 海洋蓝 · 贴纸 20","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_21.png","name":"人鱼汉顿 海洋蓝 · 贴纸 21","sheet":false},{"path":"assets/wall_stickers/hangyodon/hangyodon_22.png","name":"人鱼汉顿 海洋蓝 · 贴纸 22","sheet":false}]};
    const STICKER_THEME_NAMES = { hello_kitty: 'Hello Kitty', kuromi: '库洛米', cinnamoroll: '玉桂狗', hangyodon: '人鱼汉顿' };
    async function loadWallArtAssets() {
      const records = await dbRequest('wallArt', 'readonly', 'getAll');
      records.forEach(record => {
        const url = mediaUrl(record);
        if (url && !wallArtAssets.has(record.id)) wallArtAssets.set(record.id, url);
      });
    }

    // -------------------- 面板切换 --------------------
    function syncPanelOpen() {
      const modalOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(m => m.classList.contains('active'));
      document.body.classList.toggle('panel-open', Boolean(document.querySelector('.panel.active')) || modalOpen);
    }
    function closePanels() { document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active')); syncPanelOpen(); }
    function openPanel(id) {
      closePanels(); document.getElementById(id).classList.add('active'); syncPanelOpen();
      if (id === 'panel-settings') fillSettings();
      if (id === 'panel-menu') renderMenuPanel();
      if (id === 'panel-house') {
        renderHouseControls();
        applyRoomMode(state.room.mode || 'photo');
        villaEnsureReady();
        requestAnimationFrame(() => { if (state.room.mode === '3d') openRoom3DEditor(); });
      }
      if (id === 'panel-environment') fillEnvironmentPanel();
    }
    document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
      document.getElementById(button.dataset.close)?.classList.remove('active');
      if (button.dataset.close === 'recipeDialog') document.getElementById('recipeBackdrop')?.classList.remove('active');
      if (button.dataset.close === 'orderDialog') document.getElementById('orderBackdrop')?.classList.remove('active');
      if (button.dataset.close === 'orderShareDialog') document.getElementById('orderShareBackdrop')?.classList.remove('active');
      if (button.dataset.close === 'orderImportDialog') document.getElementById('orderImportBackdrop')?.classList.remove('active');
      syncPanelOpen();
      if (button.dataset.close === 'panel-house') {
        f3d.active = false;
        if (f3d.mode === 'walk') f3dExitWalk(true);
        if (window.VillaBridge) window.VillaBridge.save();
      }
    }));
    document.getElementById('recipeBackdrop')?.addEventListener('click', () => closeRecipe());
    document.getElementById('albumBtn').addEventListener('click', () => { renderRiverPanel(); openPanel('panel-river'); });
    document.getElementById('settingsBtn').addEventListener('click', () => openPanel('panel-settings'));
    document.getElementById('environmentChip').addEventListener('click', () => openPanel('panel-environment'));

    // -------------------- 漂流瓶：Canvas 拟真水面漂浮（透视、玻璃折射、倒影、尾迹） --------------------
    const bottleLayer = document.getElementById('bottleLayer');
    const bottleCanvas = document.getElementById('bottleCanvas');
    const bottleCtx = bottleCanvas.getContext('2d');
    const bottleNodes = new Map();
    let hoveredBottleId = null;
    // 河道曲线贴合背景照片中的水面：远处桥下 -> 近处左下河湾
    const riverSegments = [
      [[50, 24], [44, 25], [37, 29], [30, 33]],
      [[30, 33], [24, 36], [18, 39], [14, 44]],
      [[14, 44], [11, 50], [13, 58], [12, 66]],
      [[12, 66], [10, 74], [9, 84], [13, 96]]
    ];
    function bezierPoint(segment, t) {
      const [p0, p1, p2, p3] = segment, mt = 1 - t;
      const x = mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0];
      const y = mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1];
      return { x, y };
    }
    function riverPoint(t) {
      const scaled = Math.max(0, Math.min(.999999, t)) * riverSegments.length;
      const index = Math.floor(scaled), localT = scaled - index;
      const point = bezierPoint(riverSegments[index], localT);
      const ahead = bezierPoint(riverSegments[index], Math.min(1, localT + .01));
      return { ...point, angle: Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI };
    }
    function resizeBottleCanvas() {
      const rect = bottleLayer.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      bottleCanvas.width = Math.max(1, Math.round(rect.width * ratio));
      bottleCanvas.height = Math.max(1, Math.round(rect.height * ratio));
    }
    // 玻璃瓶身：本地坐标系长轴沿 +X，瓶口在右侧，随水流方向摆放
    function drawGlass(ctx, L, W, night, reflection) {
      const bodyLeft = -L * .62, shoulder = L * .18, neckEnd = L * .5, w = W * .5;
      ctx.beginPath();
      ctx.moveTo(bodyLeft + w * .6, -w);
      ctx.lineTo(shoulder - w * .2, -w);
      ctx.quadraticCurveTo(shoulder + w * .2, -w, shoulder + w * .2, -w * .45);
      ctx.lineTo(neckEnd, -w * .45); ctx.lineTo(neckEnd, w * .45);
      ctx.lineTo(shoulder + w * .2, w * .45);
      ctx.quadraticCurveTo(shoulder + w * .2, w, shoulder - w * .2, w);
      ctx.lineTo(bodyLeft + w * .6, w);
      ctx.quadraticCurveTo(bodyLeft, w, bodyLeft, w * .55);
      ctx.lineTo(bodyLeft, -w * .55);
      ctx.quadraticCurveTo(bodyLeft, -w, bodyLeft + w * .6, -w);
      ctx.closePath();
      const glass = ctx.createLinearGradient(0, -w, 0, w);
      glass.addColorStop(0, night ? 'rgba(186,226,244,.92)' : 'rgba(204,240,228,.95)');
      glass.addColorStop(.34, night ? 'rgba(76,138,166,.82)' : 'rgba(84,164,150,.80)');
      glass.addColorStop(.72, night ? 'rgba(18,58,82,.92)' : 'rgba(30,90,84,.88)');
      glass.addColorStop(1, night ? 'rgba(8,30,46,.96)' : 'rgba(16,58,58,.94)');
      ctx.fillStyle = glass; ctx.fill();
      ctx.strokeStyle = night ? 'rgba(226,242,255,.78)' : 'rgba(246,255,251,.88)';
      ctx.lineWidth = Math.max(.7, W * .065); ctx.stroke();
      if (!reflection) {
        ctx.save();
        const noteX = bodyLeft + w * .85, noteW = (shoulder - bodyLeft) * .58;
        ctx.beginPath();
        ctx.rect(noteX, -w * .46, noteW, w * .92);
        ctx.clip();
        ctx.fillStyle = night ? 'rgba(255,238,199,.68)' : 'rgba(255,248,224,.80)';
        ctx.fillRect(noteX, -w * .46, noteW, w * .92);
        ctx.strokeStyle = 'rgba(128,94,64,.52)'; ctx.lineWidth = Math.max(.4, W * .035);
        for (let i = 0; i < 2; i++) {
          const lineY = -w * .16 + i * w * .3;
          ctx.beginPath(); ctx.moveTo(noteX + w * .2, lineY); ctx.lineTo(noteX + noteW - w * .2, lineY + w * .03); ctx.stroke();
        }
        ctx.restore();
      }
      ctx.fillStyle = reflection ? 'rgba(96,56,28,.6)' : '#8c5a31';
      ctx.fillRect(neckEnd - w * .25, -w * .5, w * .42, w);
      ctx.strokeStyle = 'rgba(60,36,20,.7)'; ctx.lineWidth = Math.max(.4, W * .03);
      ctx.strokeRect(neckEnd - w * .25, -w * .5, w * .42, w);
      ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.lineWidth = Math.max(.5, W * .055);
      ctx.beginPath(); ctx.moveTo(bodyLeft + w * .62, -w * .58); ctx.lineTo(shoulder - w * .3, -w * .58); ctx.stroke();
    }
    function drawBottle(ctx, x, y, scale, angle, bottle, seconds, night) {
      const L = 48 * scale, W = 17 * scale;
      ctx.save(); ctx.translate(x, y);
      // 水体接触阴影
      const shadow = ctx.createRadialGradient(0, W * .5, 1, 0, W * .5, L * .75);
      shadow.addColorStop(0, 'rgba(4,24,29,.42)'); shadow.addColorStop(1, 'rgba(4,24,29,0)');
      ctx.fillStyle = shadow; ctx.beginPath(); ctx.ellipse(0, W * .55, L * .78, W * .62, 0, 0, Math.PI * 2); ctx.fill();
      // 随水流扩散的尾迹波纹
      ctx.save(); ctx.rotate(angle);
      for (let i = 0; i < 3; i++) {
        const pulse = (seconds * .5 + i / 3 + bottle.phase) % 1;
        ctx.globalAlpha = .42 * (1 - pulse);
        ctx.strokeStyle = night ? 'rgba(198,222,246,.95)' : 'rgba(242,255,252,.95)';
        ctx.lineWidth = Math.max(.5, .9 * scale);
        ctx.beginPath();
        ctx.ellipse(-L * .72 - pulse * L * .85, 0, L * (.18 + pulse * .42), W * (.2 + pulse * .45), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      // 水面倒影
      ctx.save(); ctx.rotate(angle); ctx.globalAlpha = .18;
      ctx.translate(0, W * 1.25); ctx.scale(1, -.5);
      drawGlass(ctx, L, W, night, true); ctx.restore();
      // 瓶身本体
      ctx.save(); ctx.rotate(angle);
      if (hoveredBottleId === bottle.id) {
        ctx.strokeStyle = 'rgba(255,219,148,.85)'; ctx.lineWidth = 1.4 * scale;
        ctx.beginPath(); ctx.ellipse(0, 0, L * .9, W * 1.2, 0, 0, Math.PI * 2); ctx.stroke();
      }
      drawGlass(ctx, L, W, night, false);
      if (bottle.photoId) {
        ctx.fillStyle = night ? 'rgba(150,220,255,.98)' : 'rgba(96,168,214,.98)';
        ctx.beginPath(); ctx.arc(-L * .3, -W * .9, Math.max(1.2, W * .18), 0, Math.PI * 2); ctx.fill();
      }
      if (bottle.message) {
        ctx.fillStyle = night ? 'rgba(255,196,102,.98)' : 'rgba(234,126,82,.98)';
        ctx.beginPath(); ctx.arc(-L * .04, -W * .9, Math.max(1.1, W * .15), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore(); ctx.restore();
    }
    function createBottleNodes() {
      bottleLayer.querySelectorAll('.bottle-hit').forEach(node => node.remove());
      bottleNodes.clear();
      state.bottles.forEach(bottle => {
        const button = document.createElement('button');
        button.className = 'bottle-hit'; button.type = 'button';
        button.setAttribute('aria-label', bottle.message || bottle.photoId ? '打开有照片或留言的漂流瓶' : '打开空白漂流瓶');
        button.addEventListener('click', () => openBottle(bottle.id));
        button.addEventListener('mouseenter', () => { hoveredBottleId = bottle.id; });
        button.addEventListener('mouseleave', () => { if (hoveredBottleId === bottle.id) hoveredBottleId = null; });
        bottleLayer.appendChild(button); bottleNodes.set(bottle.id, button);
      });
    }
    let bottleAnimationStart = performance.now();
    function animateBottles(now) {
      const seconds = (now - bottleAnimationStart) / 1000;
      const night = currentNightFactor() > .45;
      bottleCtx.setTransform(bottleCanvas.width / 1000, 0, 0, bottleCanvas.height / 1000, 0, 0);
      bottleCtx.clearRect(0, 0, 1000, 1000);
      state.bottles.forEach((bottle, index) => {
        const t = (bottle.phase + seconds * bottle.speed) % 1;
        const point = riverPoint(t);
        const scale = .44 + .78 * t;
        const bob = Math.sin(seconds * 1.7 + index * 1.3) * (.8 + 1.6 * t);
        const roll = Math.sin(seconds * 1.05 + index * .9) * (2.2 + 3 * t);
        const angle = (point.angle * .16 + roll) * Math.PI / 180;
        const y = point.y + bob;
        // riverPoint 返回百分比坐标；Canvas 绘制使用 0–1000 的归一化坐标系
        drawBottle(bottleCtx, point.x * 10, y * 10, scale, angle, bottle, seconds, night);
        const node = bottleNodes.get(bottle.id);
        if (node) {
          node.style.left = `${point.x}%`; node.style.top = `${y}%`;
          node.style.width = `${Math.max(3.2, 3.6 * scale)}%`;
          node.style.height = `${Math.max(3.2, 5 * scale)}%`;
        }
      });
      requestAnimationFrame(animateBottles);
    }
    let bottleDraftPhotoId = null;
    function bottlePhotoUrl(photoId) { return state.photos.find(p => p.id === photoId)?.url || ''; }
    function renderBottlePhotoFrame() {
      const frame = document.getElementById('bottlePhotoFrame');
      const url = bottleDraftPhotoId ? bottlePhotoUrl(bottleDraftPhotoId) : '';
      if (url) { frame.style.backgroundImage = `url("${url}")`; frame.classList.add('has-photo'); document.getElementById('bottlePhotoPlaceholder').style.display = 'none'; }
      else { frame.style.backgroundImage = ''; frame.classList.remove('has-photo'); document.getElementById('bottlePhotoPlaceholder').style.display = ''; }
    }
    function renderAlbumPickList() {
      let list = document.getElementById('albumPickList');
      if (!list) { list = document.createElement('div'); list.id = 'albumPickList'; list.className = 'album-pick-list'; document.querySelector('.bottle-photo-area').appendChild(list); }
      list.innerHTML = '';
      if (!state.photos.length) { list.innerHTML = '<span class="hint" style="grid-column:1/-1">相册里还没有照片，请先上传。</span>'; return; }
      state.photos.forEach(photo => {
        const btn = document.createElement('button'); btn.type = 'button';
        btn.style.backgroundImage = `url("${photo.url}")`; btn.title = photo.name;
        btn.classList.toggle('selected', bottleDraftPhotoId === photo.id);
        btn.addEventListener('click', () => { bottleDraftPhotoId = bottleDraftPhotoId === photo.id ? null : photo.id; renderBottlePhotoFrame(); renderAlbumPickList(); });
        list.appendChild(btn);
      });
    }
    function openBottle(id) {
      const bottle = state.bottles.find(item => item.id === id); if (!bottle) return;
      state.currentBottleId = id; bottleDraftPhotoId = bottle.photoId || null;
      document.getElementById('bottleMessage').value = bottle.message || '';
      document.getElementById('bottleSubTitle').textContent = '放一张照片，写下想说的话，让它随河漂流。';
      renderBottlePhotoFrame(); renderAlbumPickList();
      document.getElementById('bottleDialog').classList.add('active');
      syncPanelOpen();
    }
    function closeBottleDialog() { document.getElementById('bottleDialog').classList.remove('active'); state.currentBottleId = null; syncPanelOpen(); }
    document.getElementById('closeBottleBtn').addEventListener('click', closeBottleDialog);
    document.getElementById('bottlePickFromAlbum').addEventListener('click', () => { renderAlbumPickList(); document.getElementById('albumPickList')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
    document.getElementById('bottleRemovePhoto').addEventListener('click', () => { bottleDraftPhotoId = null; renderBottlePhotoFrame(); renderAlbumPickList(); });
    document.getElementById('bottlePhotoUpload').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []); event.target.value = '';
      if (!files.length) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return toast('请选择图片文件');
      if (state.photos.length >= state.photoCapacity) return toast('照片容量不足，请调整设置');
      const id = `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      await dbRequest('photos', 'readwrite', 'put', { id, name: file.name, blob: file, createdAt: Date.now() });
      state.photos.push({ id, name: file.name, url: URL.createObjectURL(file) });
      bottleDraftPhotoId = id; renderBottlePhotoFrame(); renderAlbumPickList(); renderRiverPanel();
      toast('照片已上传并放入漂流瓶');
    });
    document.getElementById('saveBottleBtn').addEventListener('click', () => {
      const bottle = state.bottles.find(item => item.id === state.currentBottleId); if (!bottle) return;
      bottle.message = document.getElementById('bottleMessage').value.trim();
      bottle.photoId = bottleDraftPhotoId || null;
      saveBottles();
      const node = bottleNodes.get(bottle.id); if (node) node.classList.toggle('has-message', Boolean(bottle.message || bottle.photoId));
      closeBottleDialog(); toast(bottle.message || bottle.photoId ? '漂流瓶已封存，继续沿河漂流' : '漂流瓶已清空');
    });
    document.getElementById('emptyBottleBtn').addEventListener('click', () => { document.getElementById('bottleMessage').value = ''; bottleDraftPhotoId = null; renderBottlePhotoFrame(); renderAlbumPickList(); });

    // -------------------- 河流相册 --------------------
    function renderRiverPanel() {
      const flow = document.getElementById('photoFlow'); flow.innerHTML = '';
      document.getElementById('photoCountLabel').textContent = `${state.photos.length} / ${state.photoCapacity}`;
      state.photos.forEach(photo => {
        const card = document.createElement('div'); card.className = 'photo-card';
        card.style.backgroundImage = `url("${photo.url}")`; card.title = photo.name;
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×';
        remove.addEventListener('click', async event => {
          event.stopPropagation(); if (!confirm('确定删除这张照片吗？')) return;
          await dbRequest('photos', 'readwrite', 'delete', photo.id);
          URL.revokeObjectURL(photo.url); state.photos = state.photos.filter(item => item.id !== photo.id); renderRiverPanel();
        });
        card.appendChild(remove); flow.appendChild(card);
      });
    }
    document.getElementById('photoInput').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []); event.target.value = '';
      if (state.photos.length + files.length > state.photoCapacity) return toast('照片容量不足，请调整设置');
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const id = `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        await dbRequest('photos', 'readwrite', 'put', { id, name: file.name, blob: file, createdAt: Date.now() });
        state.photos.push({ id, name: file.name, url: URL.createObjectURL(file) });
      }
      renderRiverPanel(); toast('照片已加入河畔相册');
    });

    // -------------------- 树上的视频果实 --------------------
    function openVideoPlayer(video) {
      const modal = document.getElementById('videoModal');
      const player = document.getElementById('videoPlayer');
      const title = document.getElementById('videoModalTitle');
      if (!modal || !player) return;
      player.src = video.url;
      if (title) title.textContent = video.name || '视频';
      modal.classList.add('active');
      modal.dataset.videoId = video.id || '';
      document.body.classList.add('video-open');
      // iOS 微信里自动播放常被拦截，失败时保持暂停即可手动点播放
      const p = player.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    function closeVideoPlayer() {
      const modal = document.getElementById('videoModal');
      const player = document.getElementById('videoPlayer');
      if (player) { player.pause(); player.removeAttribute('src'); player.load(); }
      if (modal) { modal.classList.remove('active'); modal.dataset.videoId = ''; }
      document.body.classList.remove('video-open');
    }
    function renderTreePanel() {
      const list = document.getElementById('videoList'); list.innerHTML = '';
      document.getElementById('fruitCountLabel').textContent = `${state.videos.length} 个果实`;
      state.videos.forEach(video => {
        const card = document.createElement('div'); card.className = 'video-card';
        const openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:none;display:grid;place-items:center;gap:4px;padding:8px;';
        openBtn.innerHTML = `<span class="fruit">🍎</span><span class="video-name">${escapeHtml(video.name)}</span>`;
        openBtn.addEventListener('click', () => openVideoPlayer(video));
        const manage = document.createElement('div'); manage.className = 'video-manage';
        const rename = document.createElement('button'); rename.type = 'button'; rename.textContent = '重命名';
        rename.addEventListener('click', event => { event.stopPropagation(); renameVideo(video); });
        const replace = document.createElement('button'); replace.type = 'button'; replace.textContent = '替换';
        replace.addEventListener('click', event => { event.stopPropagation(); replaceVideo(video); });
        const del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '删除';
        del.addEventListener('click', event => { event.stopPropagation(); deleteVideo(video); });
        manage.appendChild(rename); manage.appendChild(replace); manage.appendChild(del);
        card.appendChild(openBtn); card.appendChild(manage);
        list.appendChild(card);
      });
    }
    async function renameVideo(video) {
      const next = window.prompt('给这个视频果实改个名字', video.name || '');
      if (next === null) return;
      const name = String(next).trim().slice(0, 60);
      if (!name) return toast('名字不能为空');
      await dbRequest('videos', 'readwrite', 'put', { id: video.id, name: name, blob: video.blob || null, dataUrl: video.dataUrl || null, createdAt: video.createdAt || Date.now() });
      video.name = name;
      renderTreePanel();
      toast(`已重命名为「${name}」`);
    }
    async function replaceVideo(video) {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'video/*';
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        await dbRequest('videos', 'readwrite', 'put', { id: video.id, name: video.name || file.name, blob: file, dataUrl: null, createdAt: video.createdAt || Date.now() });
        const idx = state.videos.findIndex(v => v.id === video.id);
        if (idx >= 0) state.videos[idx] = { id: video.id, name: video.name || file.name, url: URL.createObjectURL(file) };
        renderTreePanel();
        toast('视频已替换');
      });
      input.click();
    }
    async function deleteVideo(video) {
      if (!window.confirm(`确定要删除「${video.name || '这个视频'}」吗？删除后无法恢复。`)) return;
      await dbRequest('videos', 'readwrite', 'delete', video.id);
      const idx = state.videos.findIndex(v => v.id === video.id);
      if (idx >= 0) state.videos.splice(idx, 1);
      const modal = document.getElementById('videoModal');
      if (modal && modal.dataset.videoId === video.id) closeVideoPlayer();
      renderTreePanel();
      toast('视频已删除');
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    }
    document.getElementById('videoInput').addEventListener('change', async event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
      if (!file.type.startsWith('video/')) return toast('请选择视频文件');
      const id = `video-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      await dbRequest('videos', 'readwrite', 'put', { id, name: file.name, blob: file, createdAt: Date.now() });
      state.videos.push({ id, name: file.name, url: URL.createObjectURL(file), blob: file, createdAt: Date.now() });
      renderTreePanel(); toast('视频果实已挂到树上');
    });
    document.getElementById('closeVideoBtn').addEventListener('click', closeVideoPlayer);
    // 点击视频外的黑色区域也能关闭
    document.getElementById('videoModal').addEventListener('click', event => {
      if (event.target.id === 'videoModal') closeVideoPlayer();
    });
    // 返回键 / ESC 都能退出播放
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeVideoPlayer();
    });
    window.addEventListener('pagehide', closeVideoPlayer);
    document.addEventListener('visibilitychange', () => { if (document.hidden) closeVideoPlayer(); });

    // -------------------- 角色绑定和宠物好感度 --------------------
    let selectedGender = 'male';
    function showProfileGate(force = false) {
      if (state.profile && !force) return;
      document.getElementById('profileName').value = state.profile?.name || '';
      selectedGender = state.profile?.gender || 'male'; updateGenderChoice();
      document.getElementById('profileGate').classList.add('active');
      syncPanelOpen();
    }
    function updateGenderChoice() {
      document.getElementById('chooseMale').classList.toggle('selected', selectedGender === 'male');
      document.getElementById('chooseFemale').classList.toggle('selected', selectedGender === 'female');
    }
    document.querySelectorAll('[data-gender]').forEach(button => button.addEventListener('click', () => {
      selectedGender = button.dataset.gender; updateGenderChoice();
    }));
    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
      const name = document.getElementById('profileName').value.trim();
      if (!name) return toast('请先填写角色昵称');
      state.profile = { name, gender: selectedGender }; saveProfile();
      document.getElementById('profileGate').classList.remove('active'); updateProfileUI(); syncPanelOpen();
      if (document.getElementById('panel-pet').classList.contains('active')) renderPetPanel();
      // 角色跟随账号：在任何设备用同一账号登录，都是同一个角色
      if (AH && AH.account && AH.account.user) {
        try {
          await AH.setProfile({ nickname: name, gender: selectedGender });
          updateSettingsAccountUI();
          toast(`角色「${name}」绑定成功，已同步到你的账号 💕`);
          return;
        } catch (error) { console.warn('[账号] 角色同步失败', error && error.message); }
      }
      toast(`角色「${name}」绑定成功`);
    });
    function updateProfileUI() {
      const chip = document.getElementById('profileChip');
      const acc = AH ? AH.account : null;
      const pairPill = acc && acc.pairCode ? `<span class="pair-pill">🔗 ${acc.pairCode}</span>` : '';
      chip.innerHTML = state.profile
        ? `👤 ${state.profile.name} · ${state.profile.gender === 'male' ? '男生' : '女生'}${pairPill}`
        : '👤 绑定角色';
      document.getElementById('settingsProfile').textContent = state.profile ? `${state.profile.name}（${state.profile.gender === 'male' ? '男生' : '女生'}）` : '尚未绑定';
    }
    document.getElementById('profileChip').addEventListener('click', () => showProfileGate(true));
    document.getElementById('editProfileBtn').addEventListener('click', () => showProfileGate(true));

    function openPet(petId) {
      if (!state.profile) { showProfileGate(); return; }
      state.currentPetId = petId; renderPetPanel(); openPanel('panel-pet');
    }
    function renderPetPanel() {
      const pet = state.pets.find(item => item.id === state.currentPetId); if (!pet) return;
      const isMale = state.profile?.gender !== 'female';
      const affinity = isMale ? pet.affinityMale : pet.affinityFemale;
      const genderText = isMale ? '男生角色' : '女生角色';
      document.getElementById('petPanelTitle').textContent = `${pet.emoji} ${pet.name}`;
      const detail = document.getElementById('petDetail'); detail.innerHTML = `
        <div class="pet-detail">
          <div class="pet-avatar">${pet.emoji}</div>
          <div class="pet-main">
            <div class="pet-name">${pet.name}</div>
            <div class="affinity-label">与你的好感度 · ${escapeHtml(state.profile?.name || '未绑定角色')}（${genderText}）</div>
            <div class="affinity-bar"><div class="affinity-fill" style="width:${affinity}%"></div></div>
            <div class="affinity-label" style="margin-top:5px">${affinity} / 100</div>
          </div>
          <div class="pet-actions">
            <button class="btn" data-action="feed">🍖 喂食</button>
            <button class="btn secondary" data-action="pet">🤚 抚摸</button>
            <button class="btn soft" data-action="play">🎾 玩耍</button>
          </div>
          <div class="pet-mood">${affinity >= 80 ? '它已经很亲近你啦！' : affinity >= 45 ? '它正在慢慢熟悉你。' : '多陪陪它，它会越来越喜欢你。'}</div>
        </div>
        <div class="row"><button class="btn soft small" id="backToScene">返回小屋</button></div>`;
      detail.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => performPetAction(pet, button.dataset.action)));
      document.getElementById('backToScene').addEventListener('click', closePanels);
    }
    function performPetAction(pet, action) {
      if (!state.profile) return showProfileGate();
      const key = `${pet.id}:${state.profile.gender}:${action}`, now = Date.now();
      const cooldown = PET_ACTIONS[action].cooldown;
      if (cooldowns.has(key) && now - cooldowns.get(key) < cooldown) return toast('动作冷却中，请稍等一下');
      cooldowns.set(key, now);
      const delta = PET_ACTIONS[action].base + Math.floor(Math.random() * 3);
      const property = state.profile.gender === 'male' ? 'affinityMale' : 'affinityFemale';
      pet[property] = Math.min(100, pet[property] + delta); savePets(); renderPetPanel();
      const labels = { feed: '喂食', pet: '抚摸', play: '玩耍' };
      toast(`${pet.name}${labels[action]}成功，好感度 +${delta}`);
    }

    // -------------------- 设置 --------------------
    function fillSettings() {
      document.getElementById('setPhotoCap').value = state.photoCapacity;
      document.getElementById('setCdFeed').value = PET_ACTIONS.feed.cooldown / 1000;
      document.getElementById('setCdPet').value = PET_ACTIONS.pet.cooldown / 1000;
      document.getElementById('setCdPlay').value = PET_ACTIONS.play.cooldown / 1000;
      updateProfileUI();
    }
    function saveSettings() {
      state.photoCapacity = Math.max(1, Number.parseInt(document.getElementById('setPhotoCap').value, 10) || 1000);
      PET_ACTIONS.feed.cooldown = Math.max(0, Number.parseFloat(document.getElementById('setCdFeed').value) || 0) * 1000;
      PET_ACTIONS.pet.cooldown = Math.max(0, Number.parseFloat(document.getElementById('setCdPet').value) || 0) * 1000;
      PET_ACTIONS.play.cooldown = Math.max(0, Number.parseFloat(document.getElementById('setCdPlay').value) || 0) * 1000;
      localStorage.setItem(STORE.settings, JSON.stringify({ photoCapacity: state.photoCapacity, cooldowns: {
        feed: PET_ACTIONS.feed.cooldown, pet: PET_ACTIONS.pet.cooldown, play: PET_ACTIONS.play.cooldown
      } }));
      toast('设置已保存');
    }
    function loadSettings() {
      let settings = safeParse(STORE.settings, null);
      if (!settings) {
        const legacy = safeParse('lh_settings_v1', null);
        if (legacy) settings = { photoCapacity: legacy.cap, cooldowns: {
          feed: (legacy.cd?.feed ?? 2) * 1000, pet: (legacy.cd?.pet ?? 1) * 1000, play: (legacy.cd?.play ?? 1.5) * 1000
        } };
      }
      if (!settings) return;
      state.photoCapacity = settings.photoCapacity || 1000;
      if (settings.cooldowns) Object.keys(PET_ACTIONS).forEach(key => {
        if (Number.isFinite(settings.cooldowns[key])) PET_ACTIONS[key].cooldown = settings.cooldowns[key];
      });
    }
    document.getElementById('saveSettingsBtn').addEventListener('click', () => { saveSettings(); document.getElementById('panel-settings').classList.remove('active'); });
    document.getElementById('clearDataBtn').addEventListener('click', async () => {
      if (!confirm('确定清空当前浏览器中保存的照片、视频、角色、好感度、漂流瓶和房屋装修吗？此操作无法撤销。')) return;
      await dbRequest('photos', 'readwrite', 'clear', null).catch(() => {});
      await dbRequest('videos', 'readwrite', 'clear', null).catch(() => {});
      await dbRequest('wallArt', 'readwrite', 'clear', null).catch(() => {});
      await dbRequest('roomAssets', 'readwrite', 'clear', null).catch(() => {});
      await dbRequest('roomBgs', 'readwrite', 'clear', null).catch(() => {});
      roomAssets.clear(); roomBackgrounds.clear();
      Object.values(STORE).forEach(key => localStorage.removeItem(key)); location.reload();
    });

    // -------------------- 物体悬停：只沿物体自身轮廓等比例放大，不添加阴影或任何额外装饰 --------------------
    const hoverCanvas = document.getElementById('hoverMagnifier');
    const hoverContext = hoverCanvas.getContext('2d');
    const hoverBackgroundDay = new Image(); hoverBackgroundDay.src = 'bg.jpg';
    // 夜景背景 0.36MB：改成天黑时才加载，不阻塞首屏
    let hoverBackgroundNight = null;
    function ensureNightBackground() {
      if (!hoverBackgroundNight) {
        hoverBackgroundNight = new Image();
        hoverBackgroundNight.src = 'assets/bg_night.jpg';
      }
      return hoverBackgroundNight;
    }
    const treeCutoutDay = new Image(); treeCutoutDay.src = 'assets/tree_day.png';
    const treeCutoutNight = new Image(); treeCutoutNight.src = 'assets/tree_night.png';
    const TREE_DRAW_RECT = { x: 247, y: 310, w: 373, h: 460 };
    const hoverScratch = document.createElement('canvas'); hoverScratch.width = 1000; hoverScratch.height = 1000;
    const hoverScratchCtx = hoverScratch.getContext('2d');
    const hoverState = { shape: null, progress: 0, raf: 0, tree: false };
    function buildHoverCrop(shape) {
      hoverState.tree = shape?.dataset.target === 'tree';
      const source = document.getElementById('app').dataset.time === 'night' ? hoverBackgroundNight : hoverBackgroundDay;
      if (!source.complete || !source.naturalWidth) {
        source.onload = () => { if (hoverState.shape === shape) buildHoverCrop(shape); };
        return;
      }
      const pathData = shape.getAttribute('d');
      if (!pathData || !window.Path2D) return;
      hoverScratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      hoverScratchCtx.clearRect(0, 0, 1000, 1000);
      try {
        hoverScratchCtx.save();
        hoverScratchCtx.clip(new Path2D(pathData));
        hoverScratchCtx.drawImage(source, 0, 0, 1000, 1000);
        hoverScratchCtx.restore();
      } catch (error) { console.warn('物体轮廓裁剪不可用：', error); }
    }
    function paintHover() {
      hoverContext.clearRect(0, 0, 1000, 1000);
      if (!hoverState.shape || hoverState.progress <= .001) return;
      let cx, cy, scale;
      if (hoverState.tree) {
        const r = TREE_DRAW_RECT;
        cx = r.x + r.w / 2; cy = r.y + r.h / 2;
        scale = 1 + .22 * hoverState.progress;
        const img = document.getElementById('app').dataset.time === 'night' ? treeCutoutNight : treeCutoutDay;
        if (!img.complete || !img.naturalWidth) return;
        hoverContext.save();
        hoverContext.translate(cx, cy); hoverContext.scale(scale, scale); hoverContext.translate(-cx, -cy);
        hoverContext.drawImage(img, r.x, r.y, r.w, r.h);
        hoverContext.restore();
        return;
      }
      const box = hoverState.shape.getBBox();
      cx = box.x + box.width / 2; cy = box.y + box.height / 2;
      scale = 1 + .14 * hoverState.progress;
      hoverContext.save();
      hoverContext.translate(cx, cy); hoverContext.scale(scale, scale); hoverContext.translate(-cx, -cy);
      hoverContext.drawImage(hoverScratch, 0, 0);
      hoverContext.restore();
    }
    function tickHover() {
      const target = hoverState.shape ? 1 : 0;
      const diff = target - hoverState.progress;
      if (Math.abs(diff) < .012) {
        hoverState.progress = target; paintHover(); hoverState.raf = 0;
        if (!target) hoverScratchCtx.clearRect(0, 0, 1000, 1000);
        return;
      }
      hoverState.progress += diff * .28;
      paintHover();
      hoverState.raf = requestAnimationFrame(tickHover);
    }
    function ensureHoverLoop() { if (!hoverState.raf) hoverState.raf = requestAnimationFrame(tickHover); }
    function showObjectLift(shape) {
      hoverState.shape = shape;
      buildHoverCrop(shape);
      ensureHoverLoop();
    }
    function clearObjectLift() { hoverState.shape = null; ensureHoverLoop(); }

    // -------------------- 点击热区：不设置河流/草地/人物的宽泛热区 --------------------
    document.querySelectorAll('#sceneHotspots [data-target]').forEach(shape => {
      shape.addEventListener('pointerenter', () => showObjectLift(shape));
      shape.addEventListener('pointerleave', clearObjectLift);
      const activate = () => {
        switch (shape.dataset.target) {
          case 'tree': renderTreePanel(); openPanel('panel-tree'); break;
          case 'house': openPanel('panel-house'); break;
          case 'cat': openPet('cat1'); break;
          case 'dog': openPet('dog1'); break;
        }
      };
      shape.addEventListener('click', activate);
      shape.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
    });

    // ================================================================
    // 照片级拟真房间：背景照片 + 可自由拖动/缩放/旋转的拟真家具
    // ================================================================
    const PHOTO_ROOM_BG = { living: 'assets/rooms/living.jpg', bedroom: 'assets/rooms/bedroom.jpg', bathroom: 'assets/rooms/bathroom.jpg' };
    const PHOTO_FURNITURE = {
      living: [
        { id: 'ph_sofa', name: '布艺沙发' }, { id: 'ph_table', name: '木质茶几' }, { id: 'ph_cabinet', name: '电视柜' },
        { id: 'ph_armchair', name: '单人沙发' }, { id: 'ph_lamp', name: '落地灯' }, { id: 'ph_plant', name: '绿植' }
      ],
      bedroom: [
        { id: 'bd_bed', name: '双人床' }, { id: 'bd_nightstand', name: '床头柜' }, { id: 'bd_wardrobe', name: '衣柜' },
        { id: 'bd_dresser', name: '梳妆台' }, { id: 'bd_lamp', name: '台灯' }, { id: 'bd_basket', name: '收纳篮' }
      ],
      bathroom: [
        { id: 'ba_sink', name: '洗手台' }, { id: 'ba_mirror', name: '镜子' }, { id: 'ba_bathtub', name: '浴缸' },
        { id: 'ba_toilet', name: '马桶' }, { id: 'ba_vanity', name: '浴室柜' }, { id: 'ba_towel', name: '毛巾架' }
      ]
    };
    const PHOTO_FURNITURE_PATH = id => `assets/rooms/furniture/${id}.png`;
    // 用户自己上传的房间底图与家具/装饰素材，保存在 IndexedDB，避免占用 localStorage 容量
    const roomAssets = new Map();
    const roomBackgrounds = new Map();
    function roomAssetSrc(id) { return roomAssets.get(id) || PHOTO_FURNITURE_PATH(id); }
    async function loadRoomAssets() {
      try {
        const assets = await dbRequest('roomAssets', 'readonly', 'getAll');
        assets.forEach(record => { const url = mediaUrl(record); if (url) roomAssets.set(record.id, url); });
        const backgrounds = await dbRequest('roomBgs', 'readonly', 'getAll');
        backgrounds.forEach(record => { const url = mediaUrl(record); if (url) roomBackgrounds.set(record.room, url); });
      } catch (error) { console.warn('房间自定义素材恢复失败：', error); }
    }
    const photoViewport = document.getElementById('photoRoomViewport');
    const photoFurnitureLayer = document.getElementById('photoFurnitureLayer');
    let photoFurnitureDrag = null;
    function applyRoomMode() {
      // 「完整别墅」与「单间装修」两套创作空间，顶部分段切换
      state.room.mode = 'photo';
      document.getElementById('roomViewport').style.display = 'none';
      document.getElementById('roomFooterHint').textContent = '第一人称走进房间：WASD 自由走动，准星选家具，点家具库即可摆放；按 Q/R 旋转、[ ] 缩放。';
      const houseMode = state.room.houseMode || 'villa';
      const panel = document.getElementById('panel-house');
      panel.classList.toggle('mode-villa', houseMode === 'villa');
      panel.classList.toggle('mode-room', houseMode !== 'villa');
      document.querySelectorAll('#houseModeSwitch button').forEach(button => {
        button.classList.toggle('active', button.dataset.houseMode === houseMode);
      });
      if (houseMode === 'villa') {
        // 别墅引擎接管：暂停旧单房间渲染，避免两套 3D 同时占用 GPU
        if (f3d.mode === 'walk') f3dExitWalk(true);
        f3d.active = false;
        villaEnsureReady();
        window.VillaBridge?.refresh();
      } else {
        f3dShow();
      }
      saveRoom();
    }
    function renderPhotoRoomBackground() {
      const room = state.room.currentRoom;
      const custom = state.room.customBackgrounds[room] && roomBackgrounds.get(room);
      photoViewport.style.backgroundImage = `url("${custom || PHOTO_ROOM_BG[room]}")`;
      const label = document.getElementById('roomBgStatus');
      if (label) label.textContent = custom ? '当前使用你上传的房间背景' : '当前使用默认拟真空房间';
    }
    function renderPhotoFurniturePalette() {
      const palette = document.getElementById('photoFurniturePalette'); palette.innerHTML = '';
      const room = state.room.currentRoom;
      const items = [
        ...PHOTO_FURNITURE[room].map(item => ({ ...item, custom: false })),
        ...(state.room.customAssets[room] || []).map(item => ({ ...item, custom: true }))
      ];
      items.forEach(item => {
        const btn = document.createElement('button'); btn.type = 'button'; btn.title = `添加${item.name}`;
        const img = document.createElement('img'); img.src = roomAssetSrc(item.id); img.alt = item.name;
        const label = document.createElement('span'); label.textContent = item.name;
        btn.appendChild(img); btn.appendChild(label);
        if (item.custom) {
          const remove = document.createElement('i'); remove.className = 'custom-asset-remove'; remove.textContent = '×'; remove.title = '移除这个自定义素材';
          remove.addEventListener('click', event => { event.stopPropagation(); deleteCustomAsset(item.id); });
          btn.appendChild(remove);
        }
        btn.addEventListener('click', () => addPhotoFurniture(item.id));
        palette.appendChild(btn);
      });
    }
    function selectedPhotoFurniture() {
      return (state.room.photoFurniture[state.room.currentRoom] || []).find(item => item.id === state.room.selectedPhotoFurnitureId) || null;
    }
    function syncPhotoFurnitureToolbar() {
      const item = selectedPhotoFurniture();
      document.getElementById('photoFurnitureRotate').value = item?.rotation ?? 0;
      document.getElementById('photoFurnitureScale').value = item?.scale ?? 100;
    }
    function photoItemTransform(item) {
      return `translate(-50%,-50%) rotate(${item.rotation || 0}deg) scale(${(item.scale || 100) / 100}) scaleX(${item.flip ? -1 : 1})`;
    }
    function renderPhotoFurniture() {
      photoFurnitureLayer.innerHTML = '';
      const list = state.room.photoFurniture[state.room.currentRoom] || [];
      list.forEach(item => {
        const node = document.createElement('div');
        node.className = 'photo-furniture' + (item.id === state.room.selectedPhotoFurnitureId ? ' selected' : '');
        node.dataset.id = item.id;
        node.style.left = `${item.x}%`; node.style.top = `${item.y}%`;
        node.style.width = `${item.w}%`; node.style.height = `${item.h}%`;
        node.style.transform = photoItemTransform(item);
        const img = document.createElement('img'); img.src = roomAssetSrc(item.assetId); img.alt = item.name;
        const remove = document.createElement('div'); remove.className = 'furn-remove'; remove.textContent = '×'; remove.title = '删除';
        const handle = document.createElement('div'); handle.className = 'furn-handle'; handle.title = '拖动缩放';
        node.appendChild(img); node.appendChild(remove); node.appendChild(handle);
        node.addEventListener('pointerdown', event => startPhotoFurnitureDrag(event, item, 'move'));
        remove.addEventListener('pointerdown', event => event.stopPropagation());
        remove.addEventListener('click', event => { event.stopPropagation(); deletePhotoFurniture(item.id); });
        handle.addEventListener('pointerdown', event => { event.stopPropagation(); startPhotoFurnitureDrag(event, item, 'scale'); });
        photoFurnitureLayer.appendChild(node);
      });
      syncPhotoFurnitureToolbar();
    }
    function renderPhotoRoom() { renderPhotoRoomBackground(); renderPhotoFurniturePalette(); renderPhotoFurniture(); }
    function addPhotoFurniture(assetId) {
      const room = state.room.currentRoom;
      const meta = [...PHOTO_FURNITURE[room], ...(state.room.customAssets[room] || [])].find(x => x.id === assetId);
      if (!meta) return;
      const img = new Image();
      const defaultW = 24;
      const placed = (state.room.photoFurniture[room] || []).length;
      const item = {
        id: `pf_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, assetId, name: meta.name,
        x: 25 + (placed % 3) * 25, y: 80 - Math.floor(placed / 3) * 7, w: defaultW, h: defaultW,
        rotation: 0, scale: 100, flip: false
      };
      img.onload = () => { item.h = item.w * (img.naturalHeight / img.naturalWidth); renderPhotoFurniture(); };
      img.src = roomAssetSrc(assetId);
      state.room.photoFurniture[state.room.currentRoom].push(item);
      state.room.selectedPhotoFurnitureId = item.id;
      renderPhotoFurniture(); saveRoom(); toast(`已添加${meta.name}，可拖动摆放`);
    }
    function startPhotoFurnitureDrag(event, item, mode) {
      event.preventDefault();
      state.room.selectedPhotoFurnitureId = item.id;
      document.querySelectorAll('.photo-furniture').forEach(n => n.classList.toggle('selected', n.dataset.id === item.id));
      syncPhotoFurnitureToolbar();
      const rect = photoViewport.getBoundingClientRect();
      photoFurnitureDrag = {
        id: item.id, mode,
        startX: event.clientX, startY: event.clientY,
        origX: item.x, origY: item.y, origScale: item.scale || 100,
        rect
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    function onPhotoFurnitureMove(event) {
      if (!photoFurnitureDrag) return;
      const item = (state.room.photoFurniture[state.room.currentRoom] || []).find(x => x.id === photoFurnitureDrag.id);
      if (!item) return;
      const dx = event.clientX - photoFurnitureDrag.startX, dy = event.clientY - photoFurnitureDrag.startY;
      if (photoFurnitureDrag.mode === 'scale') {
        item.scale = Math.max(30, Math.min(280, photoFurnitureDrag.origScale + dx * .5 + dy * .3));
      } else {
        item.x = Math.max(2, Math.min(98, photoFurnitureDrag.origX + dx / photoFurnitureDrag.rect.width * 100));
        item.y = Math.max(2, Math.min(98, photoFurnitureDrag.origY + dy / photoFurnitureDrag.rect.height * 100));
      }
      const node = photoFurnitureLayer.querySelector(`[data-id="${item.id}"]`);
      if (node) {
        node.style.left = `${item.x}%`; node.style.top = `${item.y}%`;
        node.style.transform = photoItemTransform(item);
      }
      syncPhotoFurnitureToolbar();
    }
    function endPhotoFurnitureDrag() {
      if (photoFurnitureDrag) { photoFurnitureDrag = null; saveRoom(); }
    }
    function deletePhotoFurniture(id) {
      state.room.photoFurniture[state.room.currentRoom] = state.room.photoFurniture[state.room.currentRoom].filter(x => x.id !== id);
      if (state.room.selectedPhotoFurnitureId === id) state.room.selectedPhotoFurnitureId = null;
      renderPhotoFurniture(); saveRoom(); toast('家具已移除');
    }
    photoViewport.addEventListener('pointermove', onPhotoFurnitureMove);
    photoViewport.addEventListener('pointerup', endPhotoFurnitureDrag);
    photoViewport.addEventListener('pointercancel', endPhotoFurnitureDrag);
    photoViewport.addEventListener('pointerdown', event => {
      if (event.target === photoViewport || event.target === photoFurnitureLayer) {
        state.room.selectedPhotoFurnitureId = null;
        document.querySelectorAll('.photo-furniture').forEach(n => n.classList.remove('selected'));
      }
    });
    document.getElementById('photoFurnitureRotate').addEventListener('input', event => {
      const item = selectedPhotoFurniture(); if (!item) return;
      item.rotation = Number(event.target.value);
      const node = photoFurnitureLayer.querySelector(`[data-id="${item.id}"]`);
      if (node) node.style.transform = photoItemTransform(item);
      saveRoom();
    });
    document.getElementById('photoFurnitureScale').addEventListener('input', event => {
      const item = selectedPhotoFurniture(); if (!item) return;
      item.scale = Number(event.target.value);
      const node = photoFurnitureLayer.querySelector(`[data-id="${item.id}"]`);
      if (node) node.style.transform = photoItemTransform(item);
      saveRoom();
    });
    document.getElementById('photoFurnitureDuplicate').addEventListener('click', () => {
      const item = selectedPhotoFurniture(); if (!item) return;
      const copy = { ...item, id: `pf_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, x: Math.min(96, (item.x || 50) + 5), y: Math.min(96, (item.y || 60) + 4) };
      state.room.photoFurniture[state.room.currentRoom].push(copy);
      state.room.selectedPhotoFurnitureId = copy.id;
      renderPhotoFurniture(); saveRoom(); toast('已复制家具');
    });
    document.getElementById('photoFurnitureDelete').addEventListener('click', () => {
      const item = selectedPhotoFurniture(); if (!item) return toast('请先点击选中一件家具');
      deletePhotoFurniture(item.id);
    });
    function deleteCustomAsset(id) {
      if (!confirm('移除这个自定义素材？房间里已摆放的同款素材也会一起移除。')) return;
      ['living', 'bedroom', 'bathroom'].forEach(room => {
        state.room.customAssets[room] = (state.room.customAssets[room] || []).filter(x => x.id !== id);
        state.room.photoFurniture[room] = (state.room.photoFurniture[room] || []).filter(x => x.assetId !== id);
      });
      const old = roomAssets.get(id); if (old) URL.revokeObjectURL(old);
      roomAssets.delete(id);
      dbRequest('roomAssets', 'readwrite', 'delete', id).catch(() => {});
      state.room.selectedPhotoFurnitureId = null;
      renderPhotoRoom(); saveRoom(); toast('自定义素材已移除');
    }
    document.getElementById('roomBgUpload').addEventListener('change', async event => {
      const file = Array.from(event.target.files || [])[0]; event.target.value = '';
      if (!file) return;
      const room = state.room.currentRoom, id = `bg_${room}`;
      try {
        await dbRequest('roomBgs', 'readwrite', 'put', { id, room, blob: file });
        const old = roomBackgrounds.get(room); if (old) URL.revokeObjectURL(old);
        roomBackgrounds.set(room, URL.createObjectURL(file));
        state.room.customBackgrounds[room] = true;
        renderPhotoRoomBackground(); saveRoom(); toast('房间背景已更新');
      } catch (error) { toast('背景保存失败，请重试'); }
    });
    document.getElementById('roomBgReset').addEventListener('click', () => {
      const room = state.room.currentRoom;
      const old = roomBackgrounds.get(room); if (old) URL.revokeObjectURL(old);
      roomBackgrounds.delete(room);
      dbRequest('roomBgs', 'readwrite', 'delete', `bg_${room}`).catch(() => {});
      state.room.customBackgrounds[room] = false;
      renderPhotoRoomBackground(); saveRoom(); toast('已恢复默认背景');
    });
    document.getElementById('roomAssetUpload').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []); event.target.value = '';
      if (!files.length) return;
      const room = state.room.currentRoom;
      try {
        for (const file of files) {
          const id = `ca_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
          await dbRequest('roomAssets', 'readwrite', 'put', { id, blob: file, name: file.name });
          roomAssets.set(id, URL.createObjectURL(file));
          state.room.customAssets[room].push({ id, name: file.name.replace(/\.[^.]+$/, '') });
        }
        renderPhotoFurniturePalette(); saveRoom(); toast(`已添加 ${files.length} 件自定义素材`);
      } catch (error) { toast('素材保存失败，请重试'); }
    });
    document.getElementById('photoFurnitureFlip').addEventListener('click', () => {
      const item = selectedPhotoFurniture(); if (!item) return toast('请先点击选中一件素材');
      item.flip = !item.flip;
      const node = photoFurnitureLayer.querySelector(`[data-id="${item.id}"]`);
      if (node) node.style.transform = photoItemTransform(item);
      saveRoom();
    });
    function movePhotoFurnitureLayer(delta) {
      const list = state.room.photoFurniture[state.room.currentRoom] || [];
      const index = list.findIndex(x => x.id === state.room.selectedPhotoFurnitureId);
      if (index < 0) return toast('请先点击选中一件素材');
      const next = index + delta;
      if (next < 0 || next >= list.length) return toast(delta > 0 ? '已经在最上层' : '已经在最下层');
      [list[index], list[next]] = [list[next], list[index]];
      renderPhotoFurniture(); saveRoom();
    }
    document.getElementById('photoFurnitureLayerUp').addEventListener('click', () => movePhotoFurnitureLayer(1));
    document.getElementById('photoFurnitureLayerDown').addEventListener('click', () => movePhotoFurnitureLayer(-1));

    // ================================================================
    // 真正三维拟真房间：SketchUp 式自由布置，替代旧版照片背景
    // ================================================================
    const F3D_CATALOG = {
      living: [
        { type:'sofa', name:'布艺沙发', ico:'🛋️' }, { type:'table', name:'木质茶几', ico:'🪵' }, { type:'cabinet', name:'电视柜', ico:'📺' },
        { type:'armchair', name:'单人沙发', ico:'🪑' }, { type:'lamp', name:'落地灯', ico:'💡' }, { type:'plant', name:'绿植', ico:'🌿' },
        { type:'rug', name:'地毯', ico:'🧶' }, { type:'shelf', name:'置物架', ico:'📚' }
      ],
      bedroom: [
        { type:'bed', name:'双人床', ico:'🛏️' }, { type:'nightstand', name:'床头柜', ico:'🗄️' }, { type:'wardrobe', name:'衣柜', ico:'🚪' },
        { type:'dresser', name:'梳妆台', ico:'🪞' }, { type:'deskLamp', name:'台灯', ico:'💡' }, { type:'basket', name:'收纳篮', ico:'🧺' },
        { type:'rug', name:'地毯', ico:'🧶' }, { type:'plant', name:'绿植', ico:'🌿' }
      ],
      bathroom: [
        { type:'sink', name:'洗手台', ico:'🚰' }, { type:'mirror', name:'镜子', ico:'🪞' }, { type:'bathtub', name:'浴缸', ico:'🛁' },
        { type:'toilet', name:'马桶', ico:'🚽' }, { type:'vanity', name:'浴室柜', ico:'🧴' }, { type:'towel', name:'毛巾架', ico:'🧻' },
        { type:'plant', name:'绿植', ico:'🌿' }, { type:'shelf', name:'置物架', ico:'📚' }
      ]
    };
    const f3d = {
      ready:false, active:false, scene:null, camera:null, renderer:null, roomGroup:null, furnGroup:null,
      selectedId:null, yaw:.72, pitch:.30, dist:9.5, drag:null, orbit:null, raycaster:null, floorPlane:null, ring:null,
      mode:'orbit', shell:null, artGroup:null, lastFrame:0
    };
    const f3dViewport = document.getElementById('real3dViewport');
    const f3dCanvas = document.getElementById('real3dCanvas');
    function f3dMaterial(color, rough=.72, metal=0) {
      return new THREE.MeshStandardMaterial({ color, roughness:rough, metalness:metal });
    }
    function f3dBox(w,h,d,material,x=0,y=0,z=0) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
      mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
    }
    function f3dCyl(rt,rb,h,material,x=0,y=0,z=0,seg=18) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg), material);
      mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
    }
    function f3dSphere(r,material,x=0,y=0,z=0) {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r,1), material);
      mesh.position.set(x,y,z); mesh.castShadow = true; return mesh;
    }
    function f3dWoodTexture(dark) {
      const c = document.createElement('canvas'); c.width = c.height = 512;
      const x = c.getContext('2d');
      x.fillStyle = dark ? '#3f2b1e' : '#a87b52'; x.fillRect(0,0,512,512);
      for (let i=0;i<8;i++) {
        const y = i*64;
        x.fillStyle = dark ? `rgba(255,225,190,${.025+Math.random()*.03})` : `rgba(255,245,220,${.05+Math.random()*.05})`;
        x.fillRect(0,y,512,62);
        x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(0,y+63); x.lineTo(512,y+63); x.stroke();
        for (let j=0;j<70;j++) {
          x.fillStyle = 'rgba(255,255,255,.035)'; x.fillRect(Math.random()*512, y+Math.random()*58, 18+Math.random()*90, 1);
        }
      }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2,2); return t;
    }
    function f3dTileTexture() {
      const c = document.createElement('canvas'); c.width = c.height = 512;
      const x = c.getContext('2d'); x.fillStyle = '#d9dcd9'; x.fillRect(0,0,512,512);
      x.strokeStyle = '#b9bfbd'; x.lineWidth = 3;
      for (let i=0;i<=4;i++) { const p=i*128; x.beginPath(); x.moveTo(p,0); x.lineTo(p,512); x.moveTo(0,p); x.lineTo(512,p); x.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2,2); return t;
    }
    function f3dBuildFurniture(type) {
      const g = new THREE.Group();
      const fabric = f3dMaterial('#c9b8a4', .95), fabric2 = f3dMaterial('#a8947f', .95);
      const wood = f3dMaterial('#9b744e', .7), darkWood = f3dMaterial('#6b4d34', .68);
      const metal = f3dMaterial('#c8bda9', .35, .75), white = f3dMaterial('#f4f1ea', .55);
      const green = f3dMaterial('#5e8757', .9), glass = new THREE.MeshStandardMaterial({ color:0xbdd6dd, roughness:.12, metalness:.1, transparent:true, opacity:.5 });
      switch (type) {
        case 'sofa':
          g.add(f3dBox(2.2,.34,.95,fabric,0,.24,0), f3dBox(2.2,.7,.22,fabric2,0,.62,-.38), f3dBox(.2,.55,.95,fabric2,-1.05,.48,0), f3dBox(.2,.55,.95,fabric2,1.05,.48,0));
          for (let i=-1;i<=1;i++) g.add(f3dBox(.63,.14,.7,fabric,i*.7,.46,.08));
          g.add(f3dCyl(.05,.05,.28,darkWood,-.9,.06,.35), f3dCyl(.05,.05,.28,darkWood,.9,.06,.35));
          break;
        case 'armchair':
          g.add(f3dBox(.95,.34,.9,fabric,0,.24,0), f3dBox(.95,.68,.2,fabric2,0,.62,-.36), f3dBox(.16,.5,.9,fabric2,-.42,.47,0), f3dBox(.16,.5,.9,fabric2,.42,.47,0), f3dBox(.7,.14,.65,fabric,0,.46,.06));
          break;
        case 'table':
          g.add(f3dBox(1.25,.09,.7,wood,0,.45,0));
          [[-.53,-.27],[.53,-.27],[-.53,.27],[.53,.27]].forEach(p=>g.add(f3dBox(.07,.45,.07,darkWood,p[0],.22,p[1])));
          break;
        case 'cabinet':
          g.add(f3dBox(1.5,.62,.42,wood,0,.31,0));
          g.add(f3dBox(.7,.5,.02,darkWood,-.37,.32,.22), f3dBox(.7,.5,.02,darkWood,.37,.32,.22));
          g.add(f3dBox(.06,.02,.02,metal,-.08,.32,.24), f3dBox(.06,.02,.02,metal,.08,.32,.24));
          break;
        case 'shelf':
          g.add(f3dBox(1.05,.06,.34,wood,0,.35,0), f3dBox(1.05,.06,.34,wood,0,.75,0), f3dBox(1.05,.06,.34,wood,0,1.15,0));
          g.add(f3dBox(.06,1.2,.06,darkWood,-.5,.6,-.14), f3dBox(.06,1.2,.06,darkWood,.5,.6,-.14));
          for (let i=0;i<5;i++) g.add(f3dBox(.09,.26,.2,f3dMaterial(['#b36b58','#d7c08b','#7f9a86','#b9a6c4','#cf9a68'][i]),-.36+i*.18,.51,.02));
          break;
        case 'lamp':
          g.add(f3dCyl(.24,.26,.05,metal,0,.03,0), f3dCyl(.035,.035,1.5,metal,0,.78,0));
          g.add(f3dCyl(.2,.32,.38,f3dMaterial('#f1dfb8',.9),0,1.62,0,20));
          break;
        case 'deskLamp':
          g.add(f3dCyl(.13,.15,.04,metal,0,.02,0), f3dCyl(.025,.025,.42,metal,0,.23,0));
          g.add(f3dCyl(.1,.18,.2,f3dMaterial('#f4dfae',.9),.06,.5,0,16));
          break;
        case 'plant':
          g.add(f3dCyl(.25,.19,.38,f3dMaterial('#d4c3a8'),0,.19,0), f3dCyl(.035,.05,.55,darkWood,0,.6,0));
          [[0,1.1,0,.38],[-.28,.92,.12,.3],[.3,.98,-.1,.32],[.05,1.35,.08,.27]].forEach(p=>g.add(f3dSphere(p[3],green,p[0],p[1],p[2])));
          break;
        case 'rug': {
          const m = f3dMaterial('#c6a888', 1); const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8), m);
          mesh.rotation.x = -Math.PI/2; mesh.position.y = .015; mesh.receiveShadow = true; g.add(mesh); break;
        }
        case 'bed':
          g.add(f3dBox(1.9,.32,2.05,wood,0,.2,0), f3dBox(1.78,.22,1.9,white,0,.46,0));
          g.add(f3dBox(1.9,.8,.12,darkWood,0,.55,-1.02));
          g.add(f3dBox(1.8,.08,1.1,fabric2,0,.6,.4));
          g.add(f3dBox(.72,.16,.42,white,-.44,.65,-.68), f3dBox(.72,.16,.42,white,.44,.65,-.68));
          break;
        case 'nightstand':
          g.add(f3dBox(.52,.48,.42,wood,0,.24,0), f3dBox(.46,.18,.02,darkWood,0,.34,.22), f3dBox(.46,.18,.02,darkWood,0,.13,.22));
          g.add(f3dBox(.08,.02,.02,metal,0,.34,.24));
          break;
        case 'wardrobe':
          g.add(f3dBox(1.35,2.05,.56,wood,0,1.03,0));
          g.add(f3dBox(.62,1.9,.02,darkWood,-.34,1.05,.29), f3dBox(.62,1.9,.02,darkWood,.34,1.05,.29));
          g.add(f3dBox(.05,.22,.03,metal,-.08,1.05,.31), f3dBox(.05,.22,.03,metal,.08,1.05,.31));
          break;
        case 'dresser':
          g.add(f3dBox(1.15,.82,.45,wood,0,.41,0));
          for (let i=0;i<3;i++) g.add(f3dBox(1.02,.2,.02,darkWood,0,.18+i*.25,.235));
          g.add(f3dBox(.72,.9,.05,f3dMaterial('#ded6c8',.3,.35),0,1.4,-.12));
          break;
        case 'basket':
          g.add(f3dCyl(.26,.3,.42,f3dMaterial('#c7b18b',.95),0,.21,0,20), f3dCyl(.27,.27,.03,f3dMaterial('#a48a64'),0,.43,0,20));
          break;
        case 'sink':
          g.add(f3dCyl(.11,.16,.72,white,0,.36,0), f3dCyl(.32,.28,.13,white,0,.76,0,24));
          g.add(f3dCyl(.025,.025,.3,metal,0,.94,-.18), f3dBox(.22,.025,.025,metal,0,1.08,-.06));
          break;
        case 'mirror':
          g.add(f3dBox(.9,1.15,.06,metal,0,.85,-.3), f3dBox(.82,1.07,.02,glass,0,.85,-.26));
          break;
        case 'bathtub':
          g.add(f3dBox(1.75,.55,.78,white,0,.28,0), f3dBox(1.55,.06,.6,f3dMaterial('#b9d2d6',.25),0,.56,0));
          g.add(f3dBox(1.75,.06,.08,white,0,.58,-.36), f3dBox(1.75,.06,.08,white,0,.58,.36));
          break;
        case 'toilet':
          g.add(f3dBox(.42,.72,.3,white,0,.36,-.25), f3dCyl(.24,.2,.28,white,0,.22,.12,20), f3dCyl(.26,.26,.04,white,0,.38,.12,20));
          break;
        case 'vanity':
          g.add(f3dBox(1.1,.62,.48,wood,0,.31,0), f3dCyl(.26,.24,.1,white,0,.66,0,20));
          g.add(f3dCyl(.025,.025,.24,metal,0,.82,-.16), f3dBox(.7,.85,.04,glass,0,1.3,-.2));
          break;
        case 'towel':
          g.add(f3dCyl(.02,.02,.7,metal,-.4,1.35,0,12), f3dCyl(.02,.02,.7,metal,.4,1.35,0,12), f3dCyl(.018,.018,.82,metal,0,1.7,0,12));
          g.add(f3dBox(.68,.5,.06,f3dMaterial('#e8e3d6',.95),0,1.42,0));
          break;
        default:
          g.add(f3dBox(.6,.6,.6,wood,0,.3,0));
      }
      return g;
    }
    function f3dBuildRoom() {
      if (!f3d.ready) return;
      const old = f3d.roomGroup; if (old) f3d.scene.remove(old);
      const group = new THREE.Group();
      const style = state.room.f3dStyle[state.room.currentRoom] || { wall:'#e8e0d3', floor:'wood', lamp:true };
      const wallMat = f3dMaterial(style.wall, .95);
      const trimMat = f3dMaterial('#f5efe4', .8);
      const floorMat = new THREE.MeshStandardMaterial({ map: style.floor==='tile' ? f3dTileTexture() : f3dWoodTexture(style.floor==='dark'), roughness:.78 });
      const floor = f3dBox(9,.16,7,floorMat,0,-.08,0); group.add(floor);
      const back = f3dBox(9,3.5,.16,wallMat,0,1.75,-3.5); group.add(back);
      const side = f3dBox(.16,3.5,7,wallMat,-4.5,1.75,0); group.add(side);
      // 不封顶，像 SketchUp 一样从斜上方看清房间内部
      group.add(f3dBox(9,.12,.12,trimMat,0,.06,-3.39), f3dBox(.12,.12,7,trimMat,-4.39,.06,0));
      group.add(f3dBox(9,.1,.1,trimMat,0,3.38,-3.39));
      // 窗户：窗框、玻璃与柔和透入的光
      const winFrame = f3dMaterial('#f3eee5', .7);
      group.add(f3dBox(2.4,1.6,.1,winFrame,1.6,2.05,-3.38));
      group.add(f3dBox(2.15,1.35,.04,new THREE.MeshStandardMaterial({ color:0xcfe2e6, emissive:0x9fc2cc, emissiveIntensity:.35, roughness:.2 }),1.6,2.05,-3.31));
      group.add(f3dBox(.06,1.4,.06,winFrame,1.6,2.05,-3.28), f3dBox(2.2,.06,.06,winFrame,1.6,2.05,-3.28));
      // 墙上的两幅简约装饰画
      group.add(f3dBox(.9,.65,.05,f3dMaterial('#b99a76'),-2.2,2.1,-3.38), f3dBox(.78,.53,.02,f3dMaterial('#d9c9ae'),-2.2,2.1,-3.34));
      group.add(f3dBox(.7,.5,.05,f3dMaterial('#9d8b78'),-1.1,2.15,-3.38));
      // 地毯区与门
      group.add(f3dBox(1.2,2.3,.08,f3dMaterial('#a9835d'),-4.39,1.2,2.1));
      f3d.scene.add(group); f3d.roomGroup = group;
      f3d.lamp.intensity = style.lamp ? .8 : .1;
      f3d.winLight.intensity = style.lamp ? .28 : .5;
      f3dRenderWallArts();
      updateStyleControls();
    }
    // 把历史墙贴（含 Hello Kitty 主题素材）渲染进新的三维房间
    const f3dArtTextures = new Map();
    function f3dWallArtTexture(assetId, art) {
      if (f3dArtTextures.has(assetId)) return f3dArtTextures.get(assetId);
      const url = (art && art.builtinPath) || wallArtAssets.get(assetId);
      if (!url) return null;
      const image = new Image();
      const texture = new THREE.Texture(image);
      texture.encoding = THREE.sRGBEncoding;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      image.onload = () => { texture.needsUpdate = true; };
      image.src = url;
      f3dArtTextures.set(assetId, texture);
      return texture;
    }
    function f3dRenderWallArts() {
      if (!f3d.ready) return;
      if (!f3d.artGroup) { f3d.artGroup = new THREE.Group(); f3d.scene.add(f3d.artGroup); }
      while (f3d.artGroup.children.length) f3d.artGroup.remove(f3d.artGroup.children[0]);
      const list = state.room.wallArts?.[state.room.currentRoom] || [];
      list.forEach(art => {
        const assetId = art.assetId || art.id;
        const texture = f3dWallArtTexture(assetId, art);
        if (!texture) return;
        const wallpaper = art.mode === 'wallpaper';
        const width = wallpaper ? (art.wall === 'sideWall' ? 6.8 : 8.7) : Math.max(.35, Math.min(7.4, art.width || 1.8));
        const height = wallpaper ? 3.3 : Math.max(.25, width / Math.max(.15, art.aspect || 1));
        const material = new THREE.MeshBasicMaterial({ map:texture, transparent:true, side:THREE.DoubleSide, depthWrite:false, toneMapped:false });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
        mesh.renderOrder = 6;
        const rot = (art.rotation || 0) * Math.PI / 180;
        if (art.wall === 'sideWall') {
          mesh.position.set(-4.40, art.y ?? 2, art.x ?? 0);
          mesh.rotation.set(0, Math.PI / 2, wallpaper ? 0 : rot);
        } else {
          mesh.position.set(art.x ?? 0, art.y ?? 2, -3.40);
          mesh.rotation.set(0, 0, wallpaper ? 0 : rot);
        }
        mesh.userData.wallArtId = art.id;
        f3d.artGroup.add(mesh);
      });
    }
    function updateStyleControls() {
      const style = state.room.f3dStyle[state.room.currentRoom] || {};
      document.getElementById('f3dWall').value = style.wall || '#e8e0d3';
      document.getElementById('f3dFloor').value = style.floor || 'wood';
      document.getElementById('f3dLamp').checked = style.lamp !== false;
    }
    function f3dRenderPalette() {
      const containers = [document.getElementById('f3dPalette'), document.getElementById('fpFurnGrid')].filter(Boolean);
      const catalog = F3D_CATALOG[state.room.currentRoom] || [];
      containers.forEach(palette => {
        palette.innerHTML = '';
        catalog.forEach(entry => {
          const btn = document.createElement('button'); btn.type = 'button';
          btn.innerHTML = `<span class="f3d-ico">${entry.ico}</span>${entry.name}`;
          btn.addEventListener('click', () => {
            f3dAddFurniture(entry.type, entry.name);
            if (palette.id === 'fpFurnGrid') document.getElementById('fpFurnPanel')?.classList.remove('open');
          });
          palette.appendChild(btn);
        });
      });
    }
    function f3dRenderFurniture() {
      if (!f3d.ready) return;
      while (f3d.furnGroup.children.length) f3d.furnGroup.remove(f3d.furnGroup.children[0]);
      (state.room.f3d[state.room.currentRoom] || []).forEach(item => {
        const mesh = f3dBuildFurniture(item.type);
        mesh.userData.itemId = item.id;
        mesh.position.set(item.x || 0, 0, item.z || 0);
        mesh.rotation.y = (item.rotation || 0) * Math.PI / 180;
        mesh.scale.setScalar((item.scale || 100) / 100);
        f3d.furnGroup.add(mesh);
      });
      f3dUpdateSelection();
    }
    function f3dSelect(id) {
      f3d.selectedId = id;
      state.room.f3dSelectedId = id;
      f3dUpdateSelection();
    }
    function f3dUpdateSelection() {
      const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.selectedId);
      if (f3d.ring) f3d.ring.visible = Boolean(item);
      if (item && f3d.ring) f3d.ring.position.set(item.x || 0, .025, item.z || 0);
      document.getElementById('f3dRotate').value = item?.rotation ?? 0;
      document.getElementById('f3dScale').value = item?.scale ?? 100;
    }
    function f3dAddFurniture(type, name) {
      if (f3d.mode === 'walk') { f3dStartGhost(type, name); return; }
      const placed = (state.room.f3d[state.room.currentRoom] || []).length;
      const item = { id:`f3_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, type, name, x:-2.4 + (placed%3)*2.3, z:1.4 - Math.floor(placed/3)*1.5, rotation:0, scale:100 };
      state.room.f3d[state.room.currentRoom].push(item);
      f3d.selectedId = item.id;
      f3dRenderFurniture(); saveRoom(); toast(`已添加${name}，可直接拖动摆放`);
    }
    function f3dDeleteSelected() {
      const list = state.room.f3d[state.room.currentRoom] || [];
      const index = list.findIndex(x => x.id === f3d.selectedId);
      if (index < 0) return toast('请先点击选中一件家具');
      list.splice(index,1); f3d.selectedId = null;
      f3dRenderFurniture(); saveRoom(); toast('家具已删除');
    }
    function f3dInit() {
      if (f3d.ready) return;
      const loading = document.getElementById('real3dLoading');
      (async () => {
        let ok = false;
        try { ok = await window.__threeLoadPromise; } catch (_) {}
        if (!ok || !window.THREE) { loading.textContent = '三维引擎未能加载，请检查本地 assets/three.min.js'; return; }
        THREE = window.THREE;
        try {
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0xece5d9);
          scene.fog = new THREE.Fog(0xece5d9, 26, 55);
          const camera = new THREE.PerspectiveCamera(46, 1, .1, 100);
          const renderer = new THREE.WebGLRenderer({ canvas:f3dCanvas, antialias:true });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.outputEncoding = THREE.sRGBEncoding;
          renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .82;
          scene.add(new THREE.HemisphereLight(0xfff8ec, 0x8d795f, .5));
          const sun = new THREE.DirectionalLight(0xfff0d4, 1.0);
          sun.position.set(5,8,5); sun.castShadow = true;
          sun.shadow.mapSize.set(1024,1024);
          sun.shadow.camera.left = -8; sun.shadow.camera.right = 8; sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
          scene.add(sun);
          const lamp = new THREE.PointLight(0xffc47a, .8, 11); lamp.position.set(-.5,3,-1.3); scene.add(lamp);
          const winLight = new THREE.DirectionalLight(0xd9ecf2, .28); winLight.position.set(3,4,-5); scene.add(winLight);
          f3d.scene = scene; f3d.camera = camera; f3d.renderer = renderer;
          f3d.lamp = lamp; f3d.winLight = winLight;
          f3d.roomGroup = new THREE.Group(); scene.add(f3d.roomGroup);
          f3d.furnGroup = new THREE.Group(); scene.add(f3d.furnGroup);
          f3d.raycaster = new THREE.Raycaster();
          f3d.floorPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
          const ring = new THREE.Mesh(new THREE.RingGeometry(.42,.5,32), new THREE.MeshBasicMaterial({ color:0xe59d43, side:THREE.DoubleSide, transparent:true, opacity:.85 }));
          ring.rotation.x = -Math.PI/2; ring.visible = false; scene.add(ring); f3d.ring = ring;
          f3d.ready = true; loading.style.display = 'none';
          f3dBuildRoom(); f3dRenderFurniture(); f3dResize(); f3dLoop();
          if (f3d.pendingWalk) { f3d.pendingWalk = false; f3dSetMode('walk'); }
        } catch (error) { console.error('3D 房间初始化失败：', error); loading.textContent = '三维房间初始化失败：' + error.message; }
      })();
    }
    function f3dResize() {
      if (!f3d.ready) return;
      const w = f3dViewport.clientWidth, h = f3dViewport.clientHeight;
      if (!w || !h) return;
      f3d.renderer.setSize(w,h,false);
      f3d.camera.aspect = w/h; f3d.camera.updateProjectionMatrix();
    }
    function f3dLoop() {
      if (!f3d.ready) return;
      requestAnimationFrame(f3dLoop);
      if (!f3d.active) return;
      const now = performance.now();
      const dt = Math.min(.06, (now - (f3d.lastFrame || now)) / 1000);
      f3d.lastFrame = now;
      if (f3d.mode === 'walk') {
        f3dUpdateWalk(dt);
        f3dUpdateGhost();
      } else {
        const target = new THREE.Vector3(0,1.15,0);
        f3d.camera.position.set(
          target.x + f3d.dist * Math.sin(f3d.yaw) * Math.cos(f3d.pitch),
          target.y + f3d.dist * Math.sin(f3d.pitch),
          target.z + f3d.dist * Math.cos(f3d.yaw) * Math.cos(f3d.pitch)
        );
        f3d.camera.lookAt(target);
      }
      f3d.camera.updateMatrixWorld();
      f3dUpdateLook();
      f3dDrawMinimap();
      f3d.renderer.render(f3d.scene, f3d.camera);
    }
    function f3dPointer(event) {
      const rect = f3dCanvas.getBoundingClientRect();
      return new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1, -((event.clientY-rect.top)/rect.height)*2+1);
    }
    f3dCanvas.addEventListener('pointerdown', event => {
      if (!f3d.ready) return;
      f3d.raycaster.setFromCamera(f3dPointer(event), f3d.camera);
      const hits = f3d.raycaster.intersectObjects(f3d.furnGroup.children, true);
      if (hits.length) {
        let object = hits[0].object;
        while (object && !object.userData.itemId) object = object.parent;
        const item = object && (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === object.userData.itemId);
        if (item) {
          f3dSelect(item.id);
          const hit = f3d.raycaster.ray.intersectPlane(f3d.floorPlane, new THREE.Vector3());
          f3d.drag = { id:item.id, dx:(item.x||0)-(hit?hit.x:0), dz:(item.z||0)-(hit?hit.z:0) };
          f3dCanvas.setPointerCapture?.(event.pointerId); return;
        }
      }
      f3dSelect(null);
      f3d.orbit = { x:event.clientX, y:event.clientY, yaw:f3d.yaw, pitch:f3d.pitch };
      f3dCanvas.setPointerCapture?.(event.pointerId);
    });
    f3dCanvas.addEventListener('pointermove', event => {
      if (!f3d.ready) return;
      if (f3d.drag) {
        f3d.raycaster.setFromCamera(f3dPointer(event), f3d.camera);
        const hit = f3d.raycaster.ray.intersectPlane(f3d.floorPlane, new THREE.Vector3());
        if (!hit) return;
        const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.drag.id);
        if (!item) return;
        item.x = Math.max(-4, Math.min(4, hit.x + f3d.drag.dx));
        item.z = Math.max(-3.1, Math.min(3.1, hit.z + f3d.drag.dz));
        const mesh = f3d.furnGroup.children.find(m => m.userData.itemId === item.id);
        if (mesh) mesh.position.set(item.x, 0, item.z);
        f3dUpdateSelection(); return;
      }
      if (f3d.orbit) {
        f3d.yaw = f3d.orbit.yaw - (event.clientX - f3d.orbit.x) * .008;
        f3d.pitch = Math.max(.08, Math.min(1.25, f3d.orbit.pitch + (event.clientY - f3d.orbit.y) * .006));
      }
    });
    const f3dEndDrag = () => { if (f3d.drag) saveRoom(); f3d.drag = null; f3d.orbit = null; };
    f3dCanvas.addEventListener('pointerup', f3dEndDrag);
    f3dCanvas.addEventListener('pointercancel', f3dEndDrag);
    f3dCanvas.addEventListener('wheel', event => {
      event.preventDefault(); f3d.dist = Math.max(5.5, Math.min(18, f3d.dist + event.deltaY * .012));
    }, { passive:false });
    document.getElementById('f3dRotate').addEventListener('input', event => {
      const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.selectedId); if (!item) return;
      item.rotation = Number(event.target.value);
      const mesh = f3d.furnGroup.children.find(m => m.userData.itemId === item.id);
      if (mesh) mesh.rotation.y = item.rotation * Math.PI / 180;
      saveRoom();
    });
    document.getElementById('f3dScale').addEventListener('input', event => {
      const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.selectedId); if (!item) return;
      item.scale = Number(event.target.value);
      const mesh = f3d.furnGroup.children.find(m => m.userData.itemId === item.id);
      if (mesh) mesh.scale.setScalar(item.scale / 100);
      saveRoom();
    });
    document.getElementById('f3dDuplicate').addEventListener('click', () => {
      const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.selectedId);
      if (!item) return toast('请先点击选中一件家具');
      const copy = { ...item, id:`f3_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, x:item.x+.5, z:item.z+.5 };
      state.room.f3d[state.room.currentRoom].push(copy); f3d.selectedId = copy.id;
      f3dRenderFurniture(); saveRoom(); toast('已复制家具');
    });
    document.getElementById('f3dDelete').addEventListener('click', f3dDeleteSelected);
    document.getElementById('f3dWall').addEventListener('change', event => {
      state.room.f3dStyle[state.room.currentRoom].wall = event.target.value;
      f3dBuildRoom(); saveRoom();
    });
    document.getElementById('f3dFloor').addEventListener('change', event => {
      state.room.f3dStyle[state.room.currentRoom].floor = event.target.value;
      f3dBuildRoom(); saveRoom();
    });
    document.getElementById('f3dLamp').addEventListener('change', event => {
      state.room.f3dStyle[state.room.currentRoom].lamp = event.target.checked;
      f3dBuildRoom(); saveRoom();
    });
    new ResizeObserver(() => f3dResize()).observe(f3dViewport);

    // ================================================================
    // 第一人称游戏模式：走进房间 · WASD 漫游 · 准星拾取与放置 · 小地图
    // ================================================================
    const fpEls = {
      hud: document.getElementById('fpGameHud'),
      pause: document.getElementById('fpPause'),
      look: document.getElementById('fpLook'),
      tip: document.getElementById('fpTip'),
      map: document.getElementById('fpMinimap'),
      room: document.getElementById('fpRoomLabel'),
      count: document.getElementById('fpCountLabel'),
      walkBtn: document.getElementById('fpWalkBtn'),
      editBtn: document.getElementById('fpEditBtn')
    };
    let F3D_CENTER = null;
    function f3dCenter() { return F3D_CENTER || (F3D_CENTER = new THREE.Vector2(0, 0)); }
    f3d.walk = { x:0, z:2.5, yaw:0, pitch:0, bob:0, keys:new Set(), ghost:null, ghostRing:null, ghostType:null, ghostName:null, ghostRot:0, targetId:null, lastLook:0, fallback:false, dragLook:null, hadLock:false };

    // ===== 手机 / 平板：虚拟摇杆 + 触屏按钮，让第一人称在微信、Safari、Chrome 里都能玩 =====
    const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 ||
      (window.matchMedia && matchMedia('(pointer: coarse)').matches);
    if (IS_TOUCH) document.body.classList.add('touch-device');
    // iOS 微信/Safari 的 100vh、100dvh 与真实可视高度不一致：JS 实测后写入 --app-h 供 CSS 使用
    const fpSyncAppH = () => {
      const h = Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
      if (h > 0) document.documentElement.style.setProperty('--app-h', h + 'px');
    };
    fpSyncAppH();
    window.addEventListener('resize', fpSyncAppH);
    window.addEventListener('orientationchange', () => setTimeout(fpSyncAppH, 150));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fpSyncAppH);
    f3d.walk.joy = { x:0, y:0, id:null };
    const fpJoy = document.getElementById('fpJoystick'), fpKnob = document.getElementById('fpJoyKnob');
    if (fpJoy && fpKnob) {
      const joyMove = event => {
        const r = fpJoy.getBoundingClientRect();
        let dx = event.clientX - (r.left + r.width / 2), dy = event.clientY - (r.top + r.height / 2);
        const max = r.width * .33, dist = Math.hypot(dx, dy);
        if (dist > max) { dx = dx / dist * max; dy = dy / dist * max; }
        fpKnob.style.transform = `translate(${dx}px,${dy}px)`;
        f3d.walk.joy.x = dx / max; f3d.walk.joy.y = dy / max;
      };
      const joyEnd = () => {
        fpKnob.style.transform = ''; f3d.walk.joy.x = 0; f3d.walk.joy.y = 0; f3d.walk.joy.id = null;
      };
      fpJoy.addEventListener('pointerdown', event => {
        event.preventDefault(); event.stopPropagation();
        f3d.walk.joy.id = event.pointerId;
        try { fpJoy.setPointerCapture(event.pointerId); } catch (_) {}
        joyMove(event);
      });
      fpJoy.addEventListener('pointermove', event => {
        if (f3d.walk.joy.id === event.pointerId) { event.preventDefault(); joyMove(event); }
      });
      fpJoy.addEventListener('pointerup', event => { if (f3d.walk.joy.id === event.pointerId) joyEnd(); });
      fpJoy.addEventListener('pointercancel', joyEnd);
    }
    const fpFurnPanel = document.getElementById('fpFurnPanel');
    document.querySelectorAll('#fpGameHud .fp-touch-actions button').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'furn') {
          document.getElementById('fpDecorPanel')?.classList.remove('open');
          fpFurnPanel?.classList.toggle('open'); return;
        }
        if (act === 'decor') {
          fpFurnPanel?.classList.remove('open');
          document.getElementById('fpDecorToggle').click(); return;
        }
        if (act === 'place') f3dWalkClick(0);
        else if (act === 'cancel') f3dWalkClick(2);
        else if (act === 'select') {
          if (f3d.walk.targetId) { f3dSelect(f3d.walk.targetId); f3dUpdateHud(); toast('已选中家具，可旋转 / 缩放 / 删除'); }
          else toast('把准星对准家具，再点「选中」');
        }
        else if (act === 'rotate') {
          if (f3d.walk.ghost) { f3d.walk.ghostRot = (f3d.walk.ghostRot + 15) % 360; toast(`放置角度 ${f3d.walk.ghostRot}°`); }
          else if (f3dAdjustSelected(15, 0)) toast('已顺时针旋转 15°');
          else toast('先选中一件家具');
        }
        else if (act === 'smaller') { if (!f3dAdjustSelected(0, -10)) toast('先选中一件家具'); }
        else if (act === 'bigger') { if (!f3dAdjustSelected(0, 10)) toast('先选中一件家具'); }
        else if (act === 'delete') { if (f3d.selectedId) f3dDeleteSelected(); else toast('先选中一件家具'); }
      });
    });

    function f3dBuildShell() {
      if (!f3d.ready) return;
      if (f3d.shell) { f3d.scene.remove(f3d.shell); f3d.shell = null; }
      const style = state.room.f3dStyle[state.room.currentRoom] || { wall:'#e8e0d3' };
      const g = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({ color:style.wall, roughness:.96, side:THREE.DoubleSide });
      const ceilMat = f3dMaterial('#f6f0e5', .96);
      const trimMat = f3dMaterial('#f4ead9', .8);
      // 补齐编辑视角隐藏的右墙、前墙（留 1.5m 门洞）、天花板，形成真正的室内空间
      g.add(f3dBox(.14,3.5,7,wallMat,4.5,1.75,0));
      g.add(f3dBox(2.5,3.5,.14,wallMat,-3.25,1.75,3.5));
      g.add(f3dBox(5,3.5,.14,wallMat,2,1.75,3.5));
      g.add(f3dBox(1.5,1.3,.14,wallMat,-1.25,2.85,3.5));
      g.add(f3dBox(9,.14,7,ceilMat,0,3.57,0));
      g.add(f3dBox(.1,2.3,.1,trimMat,-2.02,1.15,3.42), f3dBox(.1,2.3,.1,trimMat,-.48,1.15,3.42), f3dBox(1.6,.1,.1,trimMat,-1.25,2.25,3.42));
      g.add(f3dBox(9,.1,.1,trimMat,0,.05,3.4), f3dBox(.1,.1,7,trimMat,4.4,.05,0));
      g.add(f3dCyl(.42,.5,.16,f3dMaterial('#f6e5c4',.85),0,3.42,-.4,24));
      g.add(f3dSphere(.12,new THREE.MeshBasicMaterial({ color:0xfff1cf }),0,3.3,-.4));
      g.visible = f3d.mode === 'walk';
      f3d.scene.add(g); f3d.shell = g;
    }

    function f3dSetMode(mode) {
      if (!f3d.ready) { toast('三维场景还在搭建，请稍等片刻'); return; }
      if (mode !== 'walk') { f3dExitWalk(); return; }
      f3d.mode = 'walk';
      f3d.walk.x = 0; f3d.walk.z = 2.5; f3d.walk.yaw = 0; f3d.walk.pitch = 0;
      f3d.walk.keys.clear(); f3d.drag = null; f3d.orbit = null;
      f3d.walk.fallback = false; f3d.walk.hadLock = false; f3d.walk.dragLook = null;
      f3dBuildShell(); if (f3d.shell) f3d.shell.visible = true;
      f3d.camera.fov = 74; f3d.camera.updateProjectionMatrix();
      fpEls.hud.classList.add('active');
      document.getElementById('panel-house').classList.add('game-mode');
      fpEls.walkBtn.classList.add('active'); fpEls.editBtn.classList.remove('active');
      document.getElementById('real3dHint').style.display = 'none';
      fpEls.pause.style.display = 'none';
      f3dUpdateHud(); fpRenderDecor(); f3dResize();
      if (IS_TOUCH) { f3d.walk.fallback = true; f3d.walk.hadLock = false; f3dUpdateHud(); }
      else f3dCanvas.requestPointerLock?.();
      setTimeout(() => {
        if (f3d.mode !== 'walk' || document.pointerLockElement === f3dCanvas) return;
        f3d.walk.fallback = true; f3d.walk.hadLock = false;
        fpEls.pause.style.display = 'none'; f3dUpdateHud();
      }, 500);
    }
    function f3dExitWalk(silent) {
      if (document.pointerLockElement === f3dCanvas) document.exitPointerLock?.();
      f3d.mode = 'orbit';
      f3d.walk.keys.clear(); f3d.drag = null; f3d.orbit = null;
      f3dClearGhost();
      if (f3d.shell) f3d.shell.visible = false;
      f3d.camera.fov = 46; f3d.camera.updateProjectionMatrix();
      fpEls.hud.classList.remove('active');
      document.getElementById('panel-house').classList.remove('game-mode');
      fpEls.editBtn.classList.add('active'); fpEls.walkBtn.classList.remove('active');
      document.getElementById('real3dHint').style.display = '';
      fpEls.pause.style.display = 'none';
      document.getElementById('fpDecorPanel')?.classList.remove('open');
      fpFurnPanel?.classList.remove('open');
      if (f3d.walk.joy) { f3d.walk.joy.x = 0; f3d.walk.joy.y = 0; f3d.walk.joy.id = null; }
      if (fpKnob) fpKnob.style.transform = '';
      if (!silent) toast('已回到编辑视角，可直接拖动家具');
    }
    function f3dUpdateWalk(dt) {
      const w = f3d.walk, keys = w.keys;
      const fx = -Math.sin(w.yaw), fz = -Math.cos(w.yaw);
      const rx = Math.cos(w.yaw), rz = -Math.sin(w.yaw);
      let mx = 0, mz = 0;
      if (keys.has('w') || keys.has('arrowup')) { mx += fx; mz += fz; }
      if (keys.has('s') || keys.has('arrowdown')) { mx -= fx; mz -= fz; }
      if (keys.has('d') || keys.has('arrowright')) { mx += rx; mz += rz; }
      if (keys.has('a') || keys.has('arrowleft')) { mx -= rx; mz -= rz; }
      const jx = w.joy ? w.joy.x : 0, jy = w.joy ? w.joy.y : 0;
      if (jx || jy) { mx += fx * (-jy) + rx * jx; mz += fz * (-jy) + rz * jx; }
      const joyMag = Math.min(1, Math.hypot(jx, jy));
      const len = Math.hypot(mx, mz);
      if (len > 0) {
        const speed = (keys.has('shift') ? 4.4 : 2.35) * dt / len * (joyMag > .05 ? Math.max(.4, joyMag) : 1);
        w.x = Math.max(-4.05, Math.min(4.05, w.x + mx * speed));
        w.z = Math.max(-3.05, Math.min(3.05, w.z + mz * speed));
        w.bob += dt * (keys.has('shift') ? 13 : 9);
      } else { w.bob += dt * 2; }
      f3d.camera.position.set(w.x, 1.62 + Math.sin(w.bob) * .022, w.z);
      f3d.camera.rotation.order = 'YXZ';
      f3d.camera.rotation.set(w.pitch, w.yaw, 0);
    }
    function f3dStartGhost(type, name) {
      if (f3d.mode !== 'walk') return;
      f3dClearGhost();
      const mesh = f3dBuildFurniture(type);
      mesh.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .45; o.material.depthWrite = false; o.castShadow = false; o.receiveShadow = false; } });
      f3d.scene.add(mesh);
      const ring = new THREE.Mesh(new THREE.RingGeometry(.44,.54,32), new THREE.MeshBasicMaterial({ color:0x8ce7c6, side:THREE.DoubleSide, transparent:true, opacity:.9 }));
      ring.rotation.x = -Math.PI/2; f3d.scene.add(ring);
      f3d.walk.ghost = mesh; f3d.walk.ghostRing = ring;
      f3d.walk.ghostType = type; f3d.walk.ghostName = name; f3d.walk.ghostRot = 0;
      f3dUpdateHud(); toast(`正在放置 ${name}：准星对准地面，左键确认`);
    }
    function f3dClearGhost() {
      const w = f3d.walk; if (!w) return;
      if (w.ghost) { f3d.scene.remove(w.ghost); w.ghost = null; }
      if (w.ghostRing) { f3d.scene.remove(w.ghostRing); w.ghostRing = null; }
      w.ghostType = null; w.ghostName = null; w.ghostRot = 0;
    }
    function f3dUpdateGhost() {
      const w = f3d.walk; if (!w.ghost) return;
      f3d.raycaster.setFromCamera(f3dCenter(), f3d.camera);
      const hit = f3d.raycaster.ray.intersectPlane(f3d.floorPlane, new THREE.Vector3());
      let x = w.x - Math.sin(w.yaw) * 2.2, z = w.z - Math.cos(w.yaw) * 2.2;
      if (hit && Math.hypot(hit.x - w.x, hit.z - w.z) < 4.2) { x = hit.x; z = hit.z; }
      x = Math.max(-3.9, Math.min(3.9, x)); z = Math.max(-2.9, Math.min(2.9, z));
      w.ghost.position.set(x, 0, z); w.ghost.rotation.y = w.ghostRot * Math.PI / 180;
      w.ghostRing.position.set(x, .025, z);
    }
    function f3dConfirmGhost() {
      const w = f3d.walk; if (!w.ghost) return;
      const item = { id:`f3_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, type:w.ghostType, name:w.ghostName, x:w.ghost.position.x, z:w.ghost.position.z, rotation:w.ghostRot, scale:100 };
      state.room.f3d[state.room.currentRoom].push(item);
      f3d.selectedId = item.id;
      f3dClearGhost(); f3dRenderFurniture(); saveRoom(); f3dUpdateHud();
      toast(`已放置 ${item.name} · Q/R 旋转 · [ ] 缩放`);
    }
    function f3dAdjustSelected(dRot, dScale) {
      const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.selectedId);
      if (!item) return false;
      if (dRot) item.rotation = ((item.rotation || 0) + dRot + 360) % 360;
      if (dScale) item.scale = Math.max(40, Math.min(220, (item.scale || 100) + dScale));
      const mesh = f3d.furnGroup.children.find(m => m.userData.itemId === item.id);
      if (mesh) { mesh.rotation.y = (item.rotation || 0) * Math.PI / 180; mesh.scale.setScalar((item.scale || 100) / 100); }
      f3dUpdateSelection(); saveRoom(); return true;
    }
    function f3dUpdateLook() {
      if (f3d.mode !== 'walk') return;
      const now = performance.now(); if (now - (f3d.walk.lastLook || 0) < 90) return;
      f3d.walk.lastLook = now;
      if (f3d.walk.ghost) {
        fpEls.look.textContent = IS_TOUCH
          ? `点「✅ 摆放」放置 ${f3d.walk.ghostName} · ↻ 旋转 · ✕ 取消`
          : `左键 放置 ${f3d.walk.ghostName} · R 旋转 · 右键取消`;
        return;
      }
      f3d.raycaster.setFromCamera(f3dCenter(), f3d.camera);
      const hits = f3d.raycaster.intersectObjects(f3d.furnGroup.children, true);
      let id = null;
      if (hits.length) { let o = hits[0].object; while (o && !o.userData.itemId) o = o.parent; if (o) id = o.userData.itemId; }
      f3d.walk.targetId = id;
      const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === id);
      fpEls.look.textContent = item
        ? (IS_TOUCH ? `👆 选中 · ${item.name}　↻ 旋转　± 缩放　🗑 删除` : `E 选中 · ${item.name}　Q/R 旋转　[ ] 缩放　Del 删除`)
        : '';
    }
    function f3dUpdateHud() {
      const names = { living:'客厅', bedroom:'卧室', bathroom:'卫生间' };
      fpEls.room.textContent = names[state.room.currentRoom] || '房间';
      fpEls.count.textContent = `${(state.room.f3d[state.room.currentRoom] || []).length} 件家具 · 第一人称`;
      fpEls.tip.textContent = IS_TOUCH
        ? (f3d.walk.ghost ? `放置 ${f3d.walk.ghostName} · 点「✅ 摆放」确认` : '左侧摇杆走动 · 画面拖动环视 · 点「🪑 家具」选一件')
        : (f3d.walk.ghost ? `放置 ${f3d.walk.ghostName} · 左键确认` : (f3d.walk.fallback ? '按住鼠标拖动环视 · 点击选中或放置家具' : '走进你的家，自由摆放每一件家具'));
    }
    function f3dDrawMinimap() {
      if (f3d.mode !== 'walk' || !fpEls.map) return;
      const c = fpEls.map, ctx = c.getContext('2d'), W = c.width, H = c.height;
      const sx = x => ((x + 4.5) / 9) * (W - 16) + 8;
      const sy = z => ((z + 3.5) / 7) * (H - 12) + 6;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(28,18,10,.58)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,230,190,.78)'; ctx.lineWidth = 1.2;
      ctx.strokeRect(sx(-4.2), sy(-3.2), sx(4.2) - sx(-4.2), sy(3.2) - sy(-3.2));
      (state.room.f3d[state.room.currentRoom] || []).forEach(item => {
        ctx.fillStyle = item.id === f3d.selectedId ? '#ffd166' : '#8fd6b4';
        ctx.fillRect(sx(item.x || 0) - 2, sy(item.z || 0) - 2, 4, 4);
      });
      const w = f3d.walk;
      ctx.save(); ctx.translate(sx(w.x), sy(w.z)); ctx.rotate(-w.yaw);
      ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(-4.5,5); ctx.lineTo(0,2.5); ctx.lineTo(4.5,5); ctx.closePath();
      ctx.fillStyle = '#ffb648'; ctx.fill(); ctx.restore();
    }

    // 输入：游戏模式优先拦截画布事件，编辑模式沿用原有拖拽逻辑
    function f3dWalkClick(button) {
      if (button === 2) { f3dClearGhost(); f3dUpdateHud(); return; }
      if (button !== 0) return;
      if (f3d.walk.ghost) { f3dConfirmGhost(); return; }
      if (f3d.walk.targetId) {
        f3dSelect(f3d.walk.targetId); f3dUpdateHud();
        const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.walk.targetId);
        toast(item ? `已选中 ${item.name}` : '已选中家具');
      }
    }
    f3dCanvas.addEventListener('pointerdown', event => {
      if (f3d.mode !== 'walk') return;
      event.stopImmediatePropagation(); event.preventDefault();
      if (document.pointerLockElement !== f3dCanvas) {
        if (IS_TOUCH) { try { f3dCanvas.setPointerCapture?.(event.pointerId); } catch (_) {} }
        else { try { f3dCanvas.requestPointerLock?.(); } catch (_) { f3d.walk.fallback = true; } }
        f3d.walk.dragLook = { x:event.clientX, y:event.clientY, moved:false, button:event.button };
        return;
      }
      f3dWalkClick(event.button);
    }, true);
    f3dCanvas.addEventListener('pointermove', event => {
      if (f3d.mode !== 'walk' || document.pointerLockElement === f3dCanvas || !f3d.walk.dragLook) return;
      const d = f3d.walk.dragLook;
      if (Math.abs(event.clientX - d.x) + Math.abs(event.clientY - d.y) > 2) d.moved = true;
      f3d.walk.yaw -= (event.clientX - d.x) * .004;
      f3d.walk.pitch = Math.max(-1.3, Math.min(1.3, f3d.walk.pitch - (event.clientY - d.y) * .004));
      d.x = event.clientX; d.y = event.clientY;
    }, true);
    f3dCanvas.addEventListener('pointerup', event => {
      if (f3d.mode !== 'walk' || document.pointerLockElement === f3dCanvas) return;
      const d = f3d.walk.dragLook; if (!d) return;
      f3d.walk.dragLook = null;
      if (!d.moved && d.button === 0) f3dWalkClick(0);
    }, true);
    f3dCanvas.addEventListener('contextmenu', event => { if (f3d.mode === 'walk') event.preventDefault(); });
    document.addEventListener('mousemove', event => {
      if (f3d.mode !== 'walk' || document.pointerLockElement !== f3dCanvas) return;
      f3d.walk.yaw -= event.movementX * .0022;
      f3d.walk.pitch = Math.max(-1.3, Math.min(1.3, f3d.walk.pitch - event.movementY * .0022));
    });
    document.addEventListener('pointerlockchange', () => {
      if (!f3d.ready || f3d.mode !== 'walk') return;
      const locked = document.pointerLockElement === f3dCanvas;
      if (locked) { f3d.walk.hadLock = true; f3d.walk.fallback = false; f3d.walk.dragLook = null; }
      fpEls.pause.style.display = (!locked && f3d.walk.hadLock) ? 'flex' : 'none';
      if (!locked && !f3d.walk.hadLock) { f3d.walk.fallback = true; f3dUpdateHud(); }
    });
    document.addEventListener('keydown', event => {
      if (f3d.mode !== 'walk' || !f3d.active) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
      const k = event.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) event.preventDefault();
      f3d.walk.keys.add(k);
      if (k === 'e' && f3d.walk.targetId) {
        f3dSelect(f3d.walk.targetId); f3dUpdateHud();
        const item = (state.room.f3d[state.room.currentRoom] || []).find(x => x.id === f3d.walk.targetId);
        toast(item ? `已选中 ${item.name} · Q/R 旋转 · [ ] 缩放 · Del 删除` : '已选中家具');
      } else if (k === 'q') { if (f3dAdjustSelected(-15, 0)) toast('已逆时针旋转 15°'); }
      else if (k === 'r') {
        if (f3d.walk.ghost) { f3d.walk.ghostRot = (f3d.walk.ghostRot + 15) % 360; toast(`放置角度 ${f3d.walk.ghostRot}°`); }
        else if (f3dAdjustSelected(15, 0)) toast('已顺时针旋转 15°');
      } else if (k === '[') { if (f3dAdjustSelected(0, -10)) toast('已缩小'); }
      else if (k === ']') { if (f3dAdjustSelected(0, 10)) toast('已放大'); }
      else if (k === 'delete' || k === 'backspace') { if (f3d.selectedId) f3dDeleteSelected(); }
    });
    document.addEventListener('keyup', event => f3d.walk.keys.delete(event.key.toLowerCase()));
    window.addEventListener('blur', () => f3d.walk.keys.clear());
    // 漫游中的快捷装修：墙面、地面、灯光即时生效
    const FP_WALLS = [['#e8e0d3','暖白'],['#d8c8b4','米灰'],['#c5d3c8','薄荷绿'],['#cdd6e2','雾霾蓝'],['#e5c9c2','豆沙粉']];
    const FP_FLOORS = [['wood','原木地板'],['tile','浅灰瓷砖'],['dark','深胡桃木']];
    function fpRenderDecor() {
      const room = state.room.currentRoom;
      const style = state.room.f3dStyle[room] || (state.room.f3dStyle[room] = { wall:'#e8e0d3', floor:'wood', lamp:true });
      const wallBox = document.getElementById('fpWallSwatches'), floorBox = document.getElementById('fpFloorSwatches');
      wallBox.innerHTML = ''; floorBox.innerHTML = '';
      FP_WALLS.forEach(([color, name]) => {
        const b = document.createElement('button'); b.type = 'button'; b.style.background = color; b.title = name;
        b.className = (style.wall || '#e8e0d3') === color ? 'active' : '';
        b.addEventListener('click', () => {
          style.wall = color; f3dBuildRoom(); f3dBuildShell(); updateStyleControls(); saveRoom(); fpRenderDecor(); toast(`墙面已换成${name}`);
        });
        wallBox.appendChild(b);
      });
      FP_FLOORS.forEach(([key, name]) => {
        const b = document.createElement('button'); b.type = 'button';
        b.style.background = key === 'tile' ? '#d9dcd9' : key === 'dark' ? '#4c3525' : '#b78a5e'; b.title = name;
        b.className = (style.floor || 'wood') === key ? 'active' : '';
        b.addEventListener('click', () => {
          style.floor = key; f3dBuildRoom(); saveRoom(); fpRenderDecor(); toast(`地面已换成${name}`);
        });
        floorBox.appendChild(b);
      });
      document.getElementById('fpLampToggle').checked = style.lamp !== false;
      fpRenderStickerLibrary(); fpRenderPlacedArts();
    }
    function fpRenderStickerLibrary() {
      const grid = document.getElementById('fpStickerGrid'); if (!grid) return;
      const theme = document.getElementById('fpStickerTheme').value;
      const items = (STICKER_CATALOG[theme] || []).slice(0, 12);
      grid.innerHTML = '';
      items.forEach(asset => {
        const b = document.createElement('button'); b.type = 'button'; b.title = `贴上 ${asset.name}`;
        const img = document.createElement('img'); img.src = asset.path; img.alt = asset.name; img.loading = 'lazy';
        b.appendChild(img);
        b.addEventListener('click', () => fpAddSticker(asset, theme));
        grid.appendChild(b);
      });
    }
    function fpRenderPlacedArts() {
      const box = document.getElementById('fpArtCurrent'); if (!box) return;
      const list = state.room.wallArts?.[state.room.currentRoom] || [];
      box.innerHTML = '';
      if (!list.length) { box.innerHTML = '<span class="fp-art-empty">本房间暂无墙贴，点上方素材即可贴上</span>'; return; }
      list.forEach(art => {
        const chip = document.createElement('div'); chip.className = 'fp-art-chip';
        const assetId = art.assetId || art.id;
        if (art.builtinPath && !wallArtAssets.has(assetId)) wallArtAssets.set(assetId, art.builtinPath);
        const src = wallArtAssets.get(assetId);
        if (src) { const img = document.createElement('img'); img.src = src; img.alt = art.name; chip.appendChild(img); }
        const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'fp-art-remove'; rm.textContent = '×'; rm.title = `移除 ${art.name}`;
        rm.addEventListener('click', async event => {
          event.stopPropagation();
          await fpRemoveWallArt(art.id);
        });
        chip.appendChild(rm); box.appendChild(chip);
      });
    }
    async function fpAddSticker(asset, theme) {
      const room = state.room.currentRoom;
      if (!state.room.wallArts[room]) state.room.wallArts[room] = [];
      const id = `wallart_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const assetId = `builtin_${theme}_${asset.path.split('/').pop().replace(/\.\w+$/, '')}_${Date.now()}`;
      wallArtAssets.set(assetId, asset.path);
      const list = state.room.wallArts[room];
      const idx = list.filter(item => item.mode !== 'wallpaper').length;
      const slots = [{ x:0, y:2.05 }, { x:-1.6, y:2.75 }, { x:1.6, y:2.75 }, { x:-1.6, y:1.2 }, { x:1.6, y:1.2 }, { x:0, y:3.1 }, { x:0, y:.85 }];
      const slot = slots[idx % slots.length];
      const art = { id, assetId, name: asset.name, wall:'backWall', mode:'sticker', x:slot.x, y:slot.y, width:asset.sheet ? 3.1 : 1.55, rotation:0, aspect:1, builtinPath:asset.path };
      list.push(art);
      saveRoom(); f3dRenderWallArts(); fpRenderPlacedArts();
      toast(`已贴上 ${asset.name}`);
    }
    async function fpRemoveWallArt(id) {
      const room = state.room.currentRoom;
      const list = state.room.wallArts[room] || [];
      const art = list.find(item => item.id === id); if (!art) return;
      state.room.wallArts[room] = list.filter(item => item.id !== id);
      const assetId = art.assetId || art.id;
      const stillUsed = ['living','bedroom','bathroom'].some(name => (state.room.wallArts[name] || []).some(item => (item.assetId || item.id) === assetId));
      if (!stillUsed && !art.builtinPath) {
        await dbRequest('wallArt', 'readwrite', 'delete', assetId).catch(() => {});
        const url = wallArtAssets.get(assetId); if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
        wallArtAssets.delete(assetId);
        const tex = wallArtTextures.get(assetId); if (tex) tex.dispose(); wallArtTextures.delete(assetId);
        const ftex = f3dArtTextures.get(assetId); if (ftex) ftex.dispose(); f3dArtTextures.delete(assetId);
      }
      saveRoom(); f3dRenderWallArts(); fpRenderPlacedArts(); toast('墙贴已移除');
    }
    document.getElementById('fpStickerTheme').addEventListener('change', fpRenderStickerLibrary);
    document.getElementById('fpWallArtUpload').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []); event.target.value = '';
      for (const file of files) await addWallArt(file);
      f3dRenderWallArts(); fpRenderPlacedArts();
    });
    document.getElementById('fpDecorToggle').addEventListener('click', () => {
      if (f3d.ready && f3d.mode !== 'walk') f3dSetMode('walk');
      fpRenderDecor();
      document.getElementById('fpDecorPanel').classList.toggle('open');
    });
    document.getElementById('fpLampToggle').addEventListener('change', event => {
      state.room.f3dStyle[state.room.currentRoom].lamp = event.target.checked;
      f3dBuildRoom(); saveRoom(); toast(event.target.checked ? '暖灯已打开' : '暖灯已关闭');
    });
    fpEls.walkBtn.addEventListener('click', () => f3dSetMode('walk'));
    fpEls.editBtn.addEventListener('click', () => f3dExitWalk());
    document.getElementById('fpResumeBtn').addEventListener('click', () => f3dCanvas.requestPointerLock?.());
    document.getElementById('fpBackBtn').addEventListener('click', () => f3dExitWalk());

    // ================================================================
    // 完整别墅：多房间 / 多楼层，毛坯装修 + 自由贴纸 + 拆墙砌墙 + 真实昼夜
    // ================================================================
    const villaEls = {
      panel: document.getElementById('villaPanel'),
      canvas: document.getElementById('villaCanvas'),
      loading: document.getElementById('villaLoading'),
      deckTabs: document.getElementById('villaDeckTabs'),
      stickerTheme: document.getElementById('villaStickerTheme'),
      walkBtn: document.getElementById('villaWalkBtn'),
      overviewBtn: document.getElementById('villaOverViewBtn')
    };
    let villaBooting = false;

    function villaBootstrap() {
      if (!window.VillaBridge || villaBooting) return;
      villaBooting = true;
      window.VillaBridge.init({
        toast: (message) => toast(message),
        getStickerCatalog: () => STICKER_CATALOG,
        getEnvHour: () => currentEnvironmentHour(performance.now()),
        getEnvNightFactor: () => currentNightFactor(performance.now()),
        getEnvWeather: () => environment.weather
      });
    }

    // 别墅面板的四个抽屉切换
    villaEls.deckTabs?.addEventListener('click', event => {
      const button = event.target.closest('button[data-deck]');
      if (!button) return;
      villaEls.deckTabs.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
      document.querySelectorAll('[data-deck-body]').forEach(body => {
        body.classList.toggle('open', body.dataset.deckBody === button.dataset.deck);
      });
      if (button.dataset.deck === 'sticker') window.VillaBridge?.refresh();
      if (button.dataset.deck === 'furniture') window.VillaBridge?.refresh();
      if (button.dataset.deck === 'wall') window.VillaBridge?.refresh();
    });

    villaEls.stickerTheme?.addEventListener('change', () => window.VillaBridge?.refresh());

    // 进屋走走 / 俯瞰全屋
    villaEls.walkBtn?.addEventListener('click', () => {
      if (!window.Villa || !window.Villa.ready) { toast('别墅还在搭建中，请稍等片刻'); return; }
      const mode = window.Villa.mode === 'walk' ? 'edit' : 'walk';
      window.Villa.setMode(mode);
      villaEls.walkBtn.textContent = mode === 'walk' ? '✏️ 回到装修视角' : '🚶 进屋走走';
      villaEls.walkBtn.classList.toggle('active', mode === 'walk');
      document.getElementById('villaCrosshair')?.classList.toggle('on', mode === 'walk');
      toast(mode === 'walk' ? '走进屋里吧，WASD 走动 · 鼠标环视 · 穿过走廊和楼梯上下楼' : '回到俯瞰装修视角');
      window.VillaBridge?.refresh();
    });

    villaEls.overviewBtn?.addEventListener('click', () => {
      if (!window.Villa || !window.Villa.ready) return;
      window.Villa.setMode('edit');
      villaEls.walkBtn.textContent = '🚶 进屋走走';
      villaEls.walkBtn.classList.remove('active');
      document.getElementById('villaCrosshair')?.classList.remove('on');
      toast('俯瞰全屋：可以清楚看到每间房的毛坯状态');
    });

    // 打开房屋面板时按需启动别墅引擎
    function villaEnsureReady() {
      if (!villaEls.panel || !villaEls.canvas) return;
      villaBootstrap();
    }

    // 房屋双模式切换
    document.getElementById('houseModeSwitch')?.addEventListener('click', event => {
      const button = event.target.closest('button[data-house-mode]');
      if (!button) return;
      state.room.houseMode = button.dataset.houseMode === 'room' ? 'room' : 'villa';
      applyRoomMode();
      toast(state.room.houseMode === 'villa' ? '已切换到完整别墅 🏘️' : '已切换到单间装修 🚪');
    });

    function f3dShow() {
      f3dViewport.classList.add('active');
      photoViewport.classList.remove('active');
      f3d.active = true;
      f3dRenderPalette(); updateStyleControls();
      f3dInit(); setTimeout(() => f3dResize(), 60);
      // 房子入口默认就是游戏：进入面板即第一人称漫游，编辑视角作为可切换选项
      if (f3d.ready) f3dSetMode('walk'); else f3d.pendingWalk = true;
    }

    // ================================================================
    // Three.js 房间模型：真实透视 3D，支持拖动旋转、滚轮/触控缩放
    // ================================================================
    const FURNITURE = {
      chinese: [
        { id: 'cn-daybed', name: '红木罗汉榻', symbol: '🛋️' }, { id: 'cn-tea', name: '圆形茶台', symbol: '🪵' },
        { id: 'cn-shelf', name: '中式博古架', symbol: '🪟' }, { id: 'cn-lantern', name: '宫灯', symbol: '🏮' },
        { id: 'cn-stool', name: '鼓凳', symbol: '🪑' }, { id: 'cn-screen', name: '木雕屏风', symbol: '🪭' }, { id: 'cn-vase', name: '青花瓷瓶', symbol: '🏺' }
      ],
      american: [
        { id: 'us-sofa', name: '美式布艺沙发', symbol: '🛋️' }, { id: 'us-table', name: '乡村实木桌', symbol: '🪑' },
        { id: 'us-chair', name: '单人休闲椅', symbol: '🪑' }, { id: 'us-lamp', name: '铁艺落地灯', symbol: '💡' },
        { id: 'us-sideboard', name: '乡村餐边柜', symbol: '🗄️' }, { id: 'us-ottoman', name: '软包脚凳', symbol: '🟫' }, { id: 'us-bookshelf', name: '复古书架', symbol: '📚' }
      ],
      european: [
        { id: 'eu-sofa', name: '雕花双人沙发', symbol: '🛋️' }, { id: 'eu-table', name: '大理石边几', symbol: '🪞' },
        { id: 'eu-cabinet', name: '复古展示柜', symbol: '🗄️' }, { id: 'eu-chandelier', name: '水晶吊灯', symbol: '💎' },
        { id: 'eu-armchair', name: '雕花扶手椅', symbol: '🪑' }, { id: 'eu-mirror', name: '金边拱形镜', symbol: '🪞' }, { id: 'eu-pouf', name: '丝绒圆凳', symbol: '🟣' }
      ],
      modern: [
        { id: 'md-sofa', name: '模块组合沙发', symbol: '🛋️' }, { id: 'md-table', name: '悬浮椭圆茶几', symbol: '⬭' },
        { id: 'md-console', name: '悬浮电视柜', symbol: '▰' }, { id: 'md-lamp', name: '弧线落地灯', symbol: '💡' },
        { id: 'md-chair', name: '模块单椅', symbol: '🪑' }, { id: 'md-shelf', name: '开放式层架', symbol: '▤' }, { id: 'md-planter', name: '几何花器', symbol: '🪴' }
      ]
    };
    const STYLE_LOOK = {
      // 所有风格进入时墙面先保持未粉刷的浅灰毛坯状态，墙漆与壁纸由用户自己决定。
      raw: { floor: '#b7b0a4', trim: '#8d8579', wall: '#d7d5cf' },
      chinese: { floor: '#8c6849', trim: '#523320', wall: '#d7d5cf' },
      american: { floor: '#b38e65', trim: '#75543c', wall: '#d7d5cf' },
      european: { floor: '#c7bba9', trim: '#aa8754', wall: '#d7d5cf' },
      modern: { floor: '#a9aaa6', trim: '#777b7b', wall: '#d7d5cf' }
    };
    let renderer = null, scene = null, camera = null, roomRoot = null, wallMaterials = [];
    let roomInitialized = false, roomYaw = Math.PI / 4, roomPitch = .32, roomDistance = 11.7;
    let draggingRoom = false, pointerMoved = false, pointerStart = null;
    
    function initRoom3D() {
      if (roomInitialized) return true;
      if (!THREE && window.THREE) THREE = window.THREE;
      if (!THREE) return false;
      const canvas = document.getElementById('room3dCanvas');
      furnitureRaycaster = new THREE.Raycaster(); pointerNdc = new THREE.Vector2();
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0xe6ded2, 1);
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        scene = new THREE.Scene(); scene.background = new THREE.Color(0xe6ded2);
        camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
        roomRoot = new THREE.Group(); scene.add(roomRoot);
        scene.add(new THREE.HemisphereLight(0xfff3df, 0x71685d, 1.25));
        const sun = new THREE.DirectionalLight(0xfff0d9, 1.25); sun.position.set(5, 9, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
        const fill = new THREE.DirectionalLight(0xd6e3ff, .42); fill.position.set(-5, 5, -2); scene.add(fill);
        attachRoomControls(canvas); roomInitialized = true;
        canvas.style.display = 'block'; document.getElementById('roomFallbackCanvas').style.display = 'none';
        document.getElementById('threeError').style.display = 'none';
        resizeRoom3D(); return true;
      } catch (error) {
        console.error('3D room initialization failed:', error);
        showRoomFallback('3D 图形初始化失败，已切换到兼容预览。'); return false;
      }
    }
    async function openRoom3DEditor() {
      const errorBox = document.getElementById('threeError');
      if (roomInitialized && renderer) { resizeRoom3D(); renderRoom3D(); return; }
      showRoomFallback('正在连接 3D 引擎备用线路，先显示可旋转的房间预览…');
      errorBox.style.display = 'block';
      errorBox.firstChild.textContent = '正在连接 3D 引擎备用线路… ';
      let ready = false;
      try { ready = await window.__threeLoadPromise; } catch (_) { ready = false; }
      if (ready && window.THREE) THREE = window.THREE;
      if (ready && initRoom3D()) { resizeRoom3D(); renderRoom3D(); return; }
      showRoomFallback('3D 引擎连接暂不可用，当前显示可旋转的兼容房间预览；其他装修按钮仍可使用。');
    }
    function showRoomFallback(message) {
      const errorBox = document.getElementById('threeError');
      errorBox.style.display = 'block';
      errorBox.firstChild.textContent = message + ' ';
      document.getElementById('room3dCanvas').style.display = 'none';
      document.getElementById('roomFallbackCanvas').style.display = 'block';
      renderFallbackRoom(); attachFallbackRoomControls();
    }
    let fallbackYaw = Math.PI / 4, fallbackPitch = .32, fallbackDistance = 11.7;
    let fallbackDrag = null, fallbackHitItems = [];
    let fallbackControlsAttached = false;
    function fallbackProject(x, y, z, width, height) {
      const cp = Math.cos(fallbackPitch), sp = Math.sin(fallbackPitch);
      const cam = [fallbackDistance * cp * Math.sin(fallbackYaw), 1.2 + fallbackDistance * sp, fallbackDistance * cp * Math.cos(fallbackYaw)];
      const target = [0, 1.25, 0];
      let fx = target[0]-cam[0], fy = target[1]-cam[1], fz = target[2]-cam[2];
      const fl = Math.hypot(fx,fy,fz)||1; fx/=fl; fy/=fl; fz/=fl;
      let rx = -fz, ry = 0, rz = fx; const rl = Math.hypot(rx,rz)||1; rx/=rl; rz/=rl;
      const ux = ry*fz-rz*fy, uy = rz*fx-rx*fz, uz = rx*fy-ry*fx;
      const dx=x-cam[0], dy=y-cam[1], dz=z-cam[2];
      const vx=dx*rx+dy*ry+dz*rz, vy=dx*ux+dy*uy+dz*uz, vz=dx*fx+dy*fy+dz*fz;
      if (vz <= .1) return { x:width/2, y:height/2, depth:99999, visible:false };
      const focal=Math.min(width,height)*1.12;
      return { x:width/2+vx*focal/vz, y:height*.53-vy*focal/vz, depth:vz, visible:true };
    }
    function renderFallbackRoom() {
      const canvas=document.getElementById('roomFallbackCanvas'); if(!canvas || canvas.style.display==='none') return;
      const rect=canvas.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
      const w=Math.max(1,rect.width), h=Math.max(1,rect.height); canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
      const ctx=canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      const grad=ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'#f4eee5'); grad.addColorStop(1,'#c9c0b4'); ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      const colors=getCurrentSurfaceColors();
      const poly=(pts,fill,stroke='#ffffff66')=>{ const ps=pts.map(p=>fallbackProject(...p,w,h)); if(ps.some(p=>!p.visible)) return; ctx.beginPath(); ctx.moveTo(ps[0].x,ps[0].y); ps.slice(1).forEach(p=>ctx.lineTo(p.x,p.y)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();} };
      // 先画地板与两面墙，组成开口式房间，便于看见内部。
      poly([[-4,0,-3.5],[4,0,-3.5],[4,0,3.5],[-4,0,3.5]],colors.floor,'#8b8175');
      poly([[-4,0,-3.5],[4,0,-3.5],[4,4,-3.5],[-4,4,-3.5]],colors.backWall,'#a99b88');
      poly([[-4,0,-3.5],[-4,0,3.5],[-4,4,3.5],[-4,4,-3.5]],colors.sideWall,'#a99b88');
      // 后墙窗户。
      poly([[-2.0,1.6,-3.405],[.2,1.6,-3.405],[.2,3.15,-3.405],[-2.0,3.15,-3.405]],'#9dbbc3aa','#8c9da0');
      // 地板网格。
      ctx.strokeStyle='#8d877d33'; ctx.lineWidth=.7; for(let i=-3;i<=3;i++){ let a=fallbackProject(i,.012,-3.4,w,h),b=fallbackProject(i,.012,3.4,w,h),c=fallbackProject(-3.9,.012,i,w,h),d=fallbackProject(3.9,.012,i,w,h); ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke(); }
      const itemFaces=[];
      const pushBox=(x,y,z,bw,bh,bd,color,index)=>{
        const v=[[x-bw/2,y,z-bd/2],[x+bw/2,y,z-bd/2],[x+bw/2,y,z+bd/2],[x-bw/2,y,z+bd/2],[x-bw/2,y+bh,z-bd/2],[x+bw/2,y+bh,z-bd/2],[x+bw/2,y+bh,z+bd/2],[x-bw/2,y+bh,z+bd/2]];
        const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];
        faces.forEach((f,fi)=>{const pts=f.map(i=>v[i]); const projected=pts.map(p=>fallbackProject(...p,w,h)); if(projected.some(p=>!p.visible)) return; const avg=projected.reduce((a,p)=>a+p.depth,0)/4; itemFaces.push({projected,depth:avg,color:fi===4?color:shadeFallback(color,fi===0?-.12:-.22),index});});
      };
      const furniture=state.room.furniture[state.room.currentRoom]||[]; fallbackHitItems=[];
      furniture.forEach((item,index)=>{ const id=item.id; const sofa=/sofa|daybed|armchair|chair|ottoman|pouf|bed/i.test(id); const tall=/shelf|cabinet|screen|mirror|vase|lamp|lantern|chandelier|planter/i.test(id); const main=item.colors?.main||styleBaseColor(id); const fabric=item.colors?.fabric||'#d6c4ad'; const x=item.x??0,z=item.z??0;
        if(sofa){pushBox(x,.12,z,1.55,.42,.78,main,index);pushBox(x,.52,z-.06,1.55,.78,.23,fabric,index);pushBox(x,.39,z+.12,1.42,.23,.52,fabric,index);}
        else if(tall){pushBox(x,.08,z,.72,1.65,.55,main,index);pushBox(x,1.7,z,.78,.1,.58,item.colors?.detail||'#b18b50',index);}
        else {pushBox(x,.08,z,1.1,.45,.78,main,index);pushBox(x,.55,z,1.12,.12,.8,fabric,index);}
      });
      itemFaces.sort((a,b)=>b.depth-a.depth); itemFaces.forEach(face=>{ctx.beginPath();ctx.moveTo(face.projected[0].x,face.projected[0].y);face.projected.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='#4b3c2c77';ctx.stroke();});
      furniture.forEach((item,index)=>{const point=fallbackProject(item.x??0,1.1,item.z??0,w,h); if(point.visible) fallbackHitItems.push({x:point.x,y:point.y,r:Math.max(24,Math.min(60,w*.06)),index});});
      // 兼容预览中的贴画缩略标记：真实贴图会在 Three.js 恢复后显示完整纹理。
      (state.room.wallArts[state.room.currentRoom]||[]).forEach(art=>{ if(art.mode==='wallpaper') return; const pos=art.wall==='sideWall'?[-3.92,art.y??2,art.x??0]:[art.x??0,art.y??2,-3.42]; const pt=fallbackProject(...pos,w,h); if(pt.visible){ctx.fillStyle='#fff8e9';ctx.strokeStyle='#bd8c51';ctx.strokeRect(pt.x-25,pt.y-20,50,40);ctx.fillRect(pt.x-25,pt.y-20,50,40);ctx.fillStyle='#98724d';ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText('🖼️',pt.x,pt.y+6);}});
      ctx.fillStyle='#654d38';ctx.font='12px Microsoft YaHei, sans-serif';ctx.textAlign='left';ctx.fillText('兼容 3D 预览 · 拖动旋转视角 · 滚轮缩放',12,h-14);
    }
    function shadeFallback(color,delta){const n=parseInt(color.replace('#',''),16);if(!Number.isFinite(n))return color;let r=(n>>16)&255,g=(n>>8)&255,b=n&255;const f=delta<0?1+delta:1+delta;r=Math.max(0,Math.min(255,Math.round(r*f)));g=Math.max(0,Math.min(255,Math.round(g*f)));b=Math.max(0,Math.min(255,Math.round(b*f)));return `rgb(${r},${g},${b})`;}
    function styleBaseColor(id){return id.startsWith('cn-')?'#70452b':id.startsWith('us-')?'#805536':id.startsWith('eu-')?'#b18b50':'#aeb4b2';}
    function attachFallbackRoomControls(){
      const canvas=document.getElementById('roomFallbackCanvas'); if(fallbackControlsAttached)return; fallbackControlsAttached=true;
      canvas.addEventListener('pointerdown',e=>{fallbackDrag={x:e.clientX,y:e.clientY,yaw:fallbackYaw,pitch:fallbackPitch,moved:false};canvas.setPointerCapture(e.pointerId);});
      canvas.addEventListener('pointermove',e=>{if(!fallbackDrag)return;const dx=e.clientX-fallbackDrag.x,dy=e.clientY-fallbackDrag.y;if(Math.abs(dx)+Math.abs(dy)>3)fallbackDrag.moved=true;if(fallbackDrag.moved){fallbackYaw=fallbackDrag.yaw-dx*.009;fallbackPitch=Math.max(.08,Math.min(.95,fallbackDrag.pitch+dy*.006));renderFallbackRoom();}});
      const finish=e=>{if(!fallbackDrag)return;if(!fallbackDrag.moved){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const hit=fallbackHitItems.find(item=>Math.hypot(item.x-x,item.y-y)<item.r);if(hit){state.room.selectedFurnitureIndex=hit.index;renderColorControls();toast('已选中家具，可调整颜色');}}if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);fallbackDrag=null;};
      canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
      canvas.addEventListener('wheel',e=>{e.preventDefault();fallbackDistance=Math.max(7.2,Math.min(17,fallbackDistance+Math.sign(e.deltaY)*.6));renderFallbackRoom();},{passive:false});
      window.addEventListener('resize',renderFallbackRoom);
    }
    function resizeRoom3D() {
      if (!renderer || !camera) return;
      const viewport = document.getElementById('roomViewport');
      const width = Math.max(1, viewport.clientWidth), height = Math.max(1, viewport.clientHeight);
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); updateRoomCamera();
    }
    function updateRoomCamera() {
      if (!camera) return;
      const horizontal = roomDistance * Math.cos(roomPitch);
      camera.position.set(horizontal * Math.sin(roomYaw), 1.2 + roomDistance * Math.sin(roomPitch), horizontal * Math.cos(roomYaw));
      camera.lookAt(0, 1.25, 0);
      if (renderer && scene) renderer.render(scene, camera);
    }
    let wallArtDrag = null;
    function setRayFromEvent(event) {
      if (!renderer || !camera || !furnitureRaycaster || !pointerNdc || !THREE) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      furnitureRaycaster.setFromCamera(pointerNdc, camera);
    }
    function findWallArtAt(event) {
      if (!renderer || !camera || !roomRoot || !furnitureRaycaster) return null;
      setRayFromEvent(event);
      const hits = furnitureRaycaster.intersectObjects(roomRoot.children, true);
      for (const hit of hits) {
        let node = hit.object;
        while (node && node !== roomRoot && node.userData.wallArtId === undefined) node = node.parent;
        if (node && node !== roomRoot && node.userData.wallArtId !== undefined) return { id: node.userData.wallArtId, point: hit.point.clone() };
      }
      return null;
    }
    function intersectArtWall(event, wall) {
      setRayFromEvent(event);
      const plane = wall === 'sideWall'
        ? new THREE.Plane(new THREE.Vector3(1, 0, 0), 3.905)
        : new THREE.Plane(new THREE.Vector3(0, 0, 1), 3.405);
      return furnitureRaycaster.ray.intersectPlane(plane, new THREE.Vector3());
    }
    function intersectFloor(event) {
      setRayFromEvent(event);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      return furnitureRaycaster.ray.intersectPlane(plane, new THREE.Vector3());
    }
    function findFurnitureAt(event) {
      if (!renderer || !camera || !roomRoot || !furnitureRaycaster) return null;
      setRayFromEvent(event);
      const hits = furnitureRaycaster.intersectObjects(roomRoot.children, true);
      for (const hit of hits) {
        let node = hit.object;
        while (node && node !== roomRoot && node.userData.itemIndex === undefined) node = node.parent;
        if (node && node !== roomRoot && node.userData.itemIndex !== undefined) return { index: node.userData.itemIndex, point: hit.point.clone(), object: node };
      }
      return null;
    }
    let furnitureDrag = null;
    function attachRoomControls(canvas) {
      canvas.addEventListener('pointerdown', event => {
        const furnHit = findFurnitureAt(event);
        if (furnHit) {
          const list = state.room.furniture[state.room.currentRoom] || [];
          const item = list[furnHit.index];
          if (item) {
            state.room.selectedFurnitureIndex = furnHit.index; state.room.selectedWallArtId = null;
            clearFurnitureSelection(); selectionBox = new window.THREE.BoxHelper(furnHit.object, 0xe6a33b); scene.add(selectionBox);
            renderColorControls(); renderWallArtControls();
            const floor = intersectFloor(event);
            const mode = event.shiftKey ? 'rotate' : event.altKey ? 'scale' : 'move';
            furnitureDrag = {
              index: furnHit.index, mode,
              startX: event.clientX, startY: event.clientY,
              origX: item.x ?? 0, origZ: item.z ?? 0,
              origRotation: item.rotation || 0, origScale: item.scale || 1,
              offsetX: floor ? (item.x ?? 0) - floor.x : 0, offsetZ: floor ? (item.z ?? 0) - floor.z : 0
            };
            draggingRoom = true; pointerMoved = false; wallArtDrag = null; pointerStart = null;
            canvas.setPointerCapture(event.pointerId);
            return;
          }
        }
        const artHit = findWallArtAt(event);
        if (artHit) {
          const art = (state.room.wallArts[state.room.currentRoom] || []).find(item => item.id === artHit.id);
          if (art && art.mode !== 'wallpaper') {
            state.room.selectedWallArtId = art.id; state.room.selectedFurnitureIndex = -1; clearFurnitureSelection();
            const point = intersectArtWall(event, art.wall);
            let coordX = art.wall === 'sideWall' ? (point?.z ?? art.x ?? 0) : (point?.x ?? art.x ?? 0);
            wallArtDrag = {
              id: art.id, wall: art.wall, mode: event.shiftKey ? 'rotate' : event.altKey ? 'scale' : 'move',
              startX: event.clientX, startY: event.clientY, startArtX: art.x ?? 0, startArtY: art.y ?? 2,
              offsetX: (art.x ?? 0) - coordX, offsetY: (art.y ?? 2) - (point?.y ?? 2),
              startWidth: art.width || 1.8, startRotation: art.rotation || 0
            };
            draggingRoom = true; pointerMoved = false; pointerStart = null; canvas.setPointerCapture(event.pointerId);
            renderWallArtControls(); renderRoom3D();
            return;
          }
        }
        draggingRoom = true; pointerMoved = false; wallArtDrag = null;
        pointerStart = { x: event.clientX, y: event.clientY, yaw: roomYaw, pitch: roomPitch };
        canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener('pointermove', event => {
        if (!draggingRoom) return;
        if (furnitureDrag) {
          const list = state.room.furniture[state.room.currentRoom] || [];
          const item = list[furnitureDrag.index];
          if (!item) return;
          const dx = event.clientX - furnitureDrag.startX, dy = event.clientY - furnitureDrag.startY;
          if (Math.abs(dx) + Math.abs(dy) > 2) pointerMoved = true;
          if (furnitureDrag.mode === 'rotate') {
            item.rotation = (furnitureDrag.origRotation + dx * Math.PI / 180 * 1.2) % (Math.PI * 2);
          } else if (furnitureDrag.mode === 'scale') {
            item.scale = Math.max(.4, Math.min(2.4, furnitureDrag.origScale + dx * .006));
          } else {
            const floor = intersectFloor(event);
            if (floor) {
              item.x = Math.max(-3.5, Math.min(3.5, floor.x + furnitureDrag.offsetX));
              item.z = Math.max(-3, Math.min(3, floor.z + furnitureDrag.offsetZ));
            }
          }
          const node = roomRoot.children.find(child => child.userData.itemIndex === furnitureDrag.index);
          if (node) {
            node.position.set(item.x ?? 0, 0, item.z ?? 0);
            node.rotation.y = item.rotation || 0;
            node.scale.setScalar(item.scale || 1);
            if (selectionBox) selectionBox.update();
          }
          renderRoom3D();
          return;
        }
        if (wallArtDrag) {
          const art = (state.room.wallArts[state.room.currentRoom] || []).find(item => item.id === wallArtDrag.id);
          if (!art) return;
          const dx = event.clientX - wallArtDrag.startX;
          const dy = event.clientY - wallArtDrag.startY;
          if (Math.abs(dx) + Math.abs(dy) > 2) pointerMoved = true;
          if (wallArtDrag.mode === 'rotate') {
            art.rotation = Math.max(-180, Math.min(180, wallArtDrag.startRotation + dx * .55));
          } else if (wallArtDrag.mode === 'scale') {
            art.width = Math.max(.35, Math.min(7.4, wallArtDrag.startWidth + dx * .012));
          } else {
            const point = intersectArtWall(event, art.wall);
            if (point) {
              const rawX = art.wall === 'sideWall' ? point.z : point.x;
              art.x = Math.max(-3.5, Math.min(3.5, rawX + wallArtDrag.offsetX));
              art.y = Math.max(.35, Math.min(3.65, point.y + wallArtDrag.offsetY));
            }
          }
          updateWallArtMeshTransform(art);
          syncWallArtSliders(art);
          return;
        }
        if (!pointerStart) return;
        const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) pointerMoved = true;
        if (pointerMoved) {
          roomYaw = pointerStart.yaw - dx * .009;
          roomPitch = Math.max(.08, Math.min(.95, pointerStart.pitch + dy * .006)); updateRoomCamera();
        }
      });
      const endDrag = event => {
        if (furnitureDrag) {
          const moved = pointerMoved;
          furnitureDrag = null;
          if (moved) { saveRoom(); toast('家具位置已更新'); }
        }
        if (wallArtDrag) {
          const moved = pointerMoved;
          const art = (state.room.wallArts[state.room.currentRoom] || []).find(item => item.id === wallArtDrag.id);
          if (art) { saveRoom(); renderWallArtControls(); if (moved) toast('墙贴位置已更新'); }
          wallArtDrag = null;
        } else {
          const wasClick = draggingRoom && !pointerMoved;
          if (wasClick) selectFurnitureAt(event);
        }
        if (draggingRoom && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        draggingRoom = false; pointerStart = null;
      };
      canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
      canvas.addEventListener('wheel', event => {
        event.preventDefault();
        if (state.room.selectedWallArtId && event.shiftKey) {
          const art = getSelectedWallArt();
          if (art && art.mode !== 'wallpaper') { art.width = Math.max(.35, Math.min(7.4, (art.width || 1.8) - Math.sign(event.deltaY) * .12)); updateWallArtMeshTransform(art); syncWallArtSliders(art); saveRoom(); }
          return;
        }
        roomDistance = Math.max(7.2, Math.min(17, roomDistance + Math.sign(event.deltaY) * .65)); updateRoomCamera();
      }, { passive: false });
      window.addEventListener('resize', resizeRoom3D);
    }
    // 家具建模时根据默认材质颜色映射为“主体 / 布料 / 细节”三类，
    // 每件家具分别保存覆盖色，因此调整一件家具不会影响同房间的其他家具。
    let activeFurnitureColorMap = null;
    function material(color, roughness = .78, metalness = .02) {
      let resolvedColor = color;
      if (activeFurnitureColorMap) {
        const role = activeFurnitureColorMap.roleByBase[String(color).toLowerCase()];
        if (role && activeFurnitureColorMap.colors[role]) resolvedColor = activeFurnitureColorMap.colors[role];
      }
      return new THREE.MeshStandardMaterial({ color: resolvedColor, roughness, metalness });
    }
    function addMesh(parent, geometry, mat, position, cast = true, receive = true) {
      const mesh = new THREE.Mesh(geometry, mat); mesh.position.set(...position); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
    }
    function box(parent, w, h, d, color, x, y, z, options = {}) {
      return addMesh(parent, new THREE.BoxGeometry(w, h, d), material(color, options.roughness ?? .8, options.metalness ?? .01), [x, y, z]);
    }
    function cylinder(parent, top, bottom, height, color, x, y, z, segments = 16, metalness = .02) {
      return addMesh(parent, new THREE.CylinderGeometry(top, bottom, height, segments), material(color, .65, metalness), [x, y, z]);
    }
    function sphere(parent, radius, color, x, y, z, scale = [1, 1, 1]) {
      const mesh = addMesh(parent, new THREE.SphereGeometry(radius, 16, 12), material(color, .48, .04), [x, y, z]); mesh.scale.set(...scale); return mesh;
    }
    function tube(parent, points, radius, color) {
      const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
      return addMesh(parent, new THREE.TubeGeometry(curve, 28, radius, 8, false), material(color, .45, .3), [0, 0, 0]);
    }
    function getCurrentSurfaceColors() {
      const style = STYLE_LOOK[state.room.currentStyle] || STYLE_LOOK.raw;
      const saved = state.room.surfaces?.[state.room.currentRoom] || {};
      return {
        backWall: saved.backWall || style.wall,
        sideWall: saved.sideWall || style.wall,
        floor: saved.floor || style.floor,
        trim: saved.trim || style.trim
      };
    }
    function createRoomShell() {
      const THREE = window.THREE, style = STYLE_LOOK[state.room.currentStyle] || STYLE_LOOK.raw;
      const colors = getCurrentSurfaceColors();
      wallMaterials = [];
      const floorMat = material(colors.floor, .86);
      const floor = addMesh(roomRoot, new THREE.BoxGeometry(8, .18, 7), floorMat, [0, -.09, 0]); floor.receiveShadow = true;
      const wallBackMat = material(colors.backWall, .92), wallLeftMat = material(colors.sideWall, .92);
      wallMaterials.push(wallBackMat, wallLeftMat);
      addMesh(roomRoot, new THREE.BoxGeometry(8, 4, .16), wallBackMat, [0, 2, -3.5]);
      addMesh(roomRoot, new THREE.BoxGeometry(.16, 4, 7), wallLeftMat, [-4, 2, 0]);
      const trim = colors.trim;
      box(roomRoot, 8, .13, .19, trim, 0, .08, -3.39);
      box(roomRoot, .19, .13, 7, trim, -3.89, .08, 0);
      // 毛坯房保留基础门窗洞口，墙面依然是连续可粉刷的墙体
      const frame = state.room.currentStyle === 'raw' ? '#77736c' : trim;
      box(roomRoot, 2.15, .12, .12, frame, -.9, 3.1, -3.38);
      box(roomRoot, 2.15, .12, .12, frame, -.9, 1.72, -3.38);
      box(roomRoot, .12, 1.5, .12, frame, -1.98, 2.4, -3.38);
      box(roomRoot, .12, 1.5, .12, frame, .18, 2.4, -3.38);
      const glass = addMesh(roomRoot, new THREE.BoxGeometry(1.98, 1.35, .025), new THREE.MeshStandardMaterial({ color: 0x9dbbc3, roughness: .18, metalness: .18, transparent: true, opacity: .52 }), [-.9, 2.4, -3.36], false, false);
      // 左侧简单门洞装饰
      box(roomRoot, .12, 2.3, .12, frame, -3.88, 1.25, 1.45);
      box(roomRoot, .12, 2.3, .12, frame, -3.88, 1.25, 3.02);
      box(roomRoot, .12, .12, 1.7, frame, -3.88, 2.4, 2.23);
      // 地面伸缩网格不遮挡空间，帮助辨认尺度
      const grid = new THREE.GridHelper(8, 16, 0x999186, 0xbeb6aa); grid.position.y = .006; grid.material.transparent = true; grid.material.opacity = .17; roomRoot.add(grid);
      renderWallArt3D();
    }

    function getWallArtTexture(assetId) {
      if (wallArtTextures.has(assetId)) return wallArtTextures.get(assetId);
      const url = wallArtAssets.get(assetId);
      if (!url) return null;
      const texture = new THREE.TextureLoader().load(url, () => updateRoomCamera());
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      wallArtTextures.set(assetId, texture);
      return texture;
    }
    function getWallArtPlacementPosition(art) {
      return art.wall === 'sideWall'
        ? new THREE.Vector3(-3.905, art.y ?? 2, art.x ?? 0)
        : new THREE.Vector3(art.x ?? 0, art.y ?? 2, -3.405);
    }
    function updateWallArtMeshTransform(art) {
      const mesh = wallArtMeshes.get(art.id);
      if (!mesh) return;
      mesh.position.copy(getWallArtPlacementPosition(art));
      if (art.wall === 'sideWall') mesh.rotation.set(0, Math.PI / 2, (art.rotation || 0) * Math.PI / 180);
      else mesh.rotation.set(0, 0, (art.rotation || 0) * Math.PI / 180);
      const scale = (art.width || 1.8) / (mesh.userData.baseWidth || art.width || 1.8);
      mesh.scale.setScalar(scale);
      const outline = roomRoot?.children.find(child => child.userData.wallArtOutlineId === art.id);
      if (outline) {
        outline.position.copy(mesh.position);
        if (art.wall === 'sideWall') outline.rotation.set(0, Math.PI / 2, (art.rotation || 0) * Math.PI / 180);
        else outline.rotation.set(0, 0, (art.rotation || 0) * Math.PI / 180);
        outline.scale.setScalar(scale);
        if (art.wall === 'sideWall') outline.position.x += .009; else outline.position.z += .009;
      }
      if (renderer && scene && camera) renderer.render(scene, camera);
    }
    function renderWallArt3D() {
      if (!roomRoot || !window.THREE) return;
      wallArtMeshes.clear();
      const list = state.room.wallArts?.[state.room.currentRoom] || [];
      list.forEach(art => {
        const texture = getWallArtTexture(art.assetId || art.id);
        if (!texture) return;
        const wallpaper = art.mode === 'wallpaper';
        const width = wallpaper ? (art.wall === 'backWall' ? 7.82 : 6.82) : Math.max(.35, Math.min(7.4, art.width || 1.8));
        const height = wallpaper ? 3.82 : Math.max(.25, width / Math.max(.15, art.aspect || 1));
        const geometry = new THREE.PlaneGeometry(width, height);
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.renderOrder = 3;
        mesh.position.copy(getWallArtPlacementPosition(art));
        if (art.wall === 'sideWall') mesh.rotation.set(0, Math.PI / 2, wallpaper ? 0 : (art.rotation || 0) * Math.PI / 180);
        else mesh.rotation.set(0, 0, wallpaper ? 0 : (art.rotation || 0) * Math.PI / 180);
        mesh.userData.wallArtId = art.id;
        mesh.userData.wallArtAssetId = art.assetId || art.id;
        mesh.userData.baseWidth = width;
        roomRoot.add(mesh);
        wallArtMeshes.set(art.id, mesh);

        if (art.id === state.room.selectedWallArtId && !wallpaper) {
          const outlineGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(width + .08, height + .08));
          const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xf0ad35, transparent: true, opacity: .98, depthTest: false });
          const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
          outline.position.copy(mesh.position);
          if (art.wall === 'sideWall') { outline.rotation.set(0, Math.PI / 2, (art.rotation || 0) * Math.PI / 180); outline.position.x += .009; }
          else { outline.rotation.set(0, 0, (art.rotation || 0) * Math.PI / 180); outline.position.z += .009; }
          outline.scale.copy(mesh.scale); outline.renderOrder = 8; outline.userData.wallArtOutlineId = art.id; roomRoot.add(outline);
        }
      });
    }

    function addModernFurniture(root, id) {
      const g = new THREE.Group(); root.add(g);
      if (id === 'md-sofa') {
        box(g, 2.6, .42, .92, '#aeb4b2', 0, .46, 0); box(g, 2.38, .18, .72, '#d5d7d1', 0, .76, .05);
        box(g, 2.45, .7, .2, '#9da5a3', 0, 1.0, -.36);
        box(g, .25, .58, .9, '#899391', -1.18, .78, .02); box(g, .25, .58, .9, '#899391', 1.18, .78, .02);
        [-.88, .88].forEach(x => box(g, .12, .24, .12, '#484b4a', x, .12, .3));
      } else if (id === 'md-table') {
        const top = addMesh(g, new THREE.CylinderGeometry(.68, .68, .12, 48), material('#d9d7cf', .3), [0, .72, 0]); top.scale.z = .62;
        cylinder(g, .19, .25, .6, '#777d7b', 0, .35, 0, 20, .3);
      } else if (id === 'md-console') {
        box(g, 2.0, .42, .48, '#a9aaa5', 0, .56, 0); box(g, 2.06, .07, .5, '#555b5a', 0, .8, 0);
        [-.72, 0, .72].forEach(x => box(g, .018, .27, .02, '#5c625f', x, .56, .246));
      } else if (id === 'md-lamp') {
        cylinder(g, .24, .28, .08, '#4b5150', 0, .04, 0, 24, .6);
        tube(g, [[0,.1,0],[0,1.1,0],[.25,1.65,0],[.8,1.8,0]], .035, '#4d5553');
        const shade = addMesh(g, new THREE.ConeGeometry(.28, .38, 24, 1, true), material('#eee5d5', .55), [.8, 1.65, 0]); shade.rotation.z = Math.PI;
        sphere(g, .1, '#f8e6ab', .8, 1.45, 0);
      } else if (id === 'md-chair') {
        box(g, .95, .38, .9, '#c9ccc7', 0, .48, 0); box(g, .95, .85, .18, '#aeb4b2', 0, .98, -.34);
        box(g, .16, .54, .86, '#9da5a3', -.4, .75, 0); box(g, .16, .54, .86, '#9da5a3', .4, .75, 0);
        [-.32,.32].forEach(x => box(g,.08,.28,.08,'#4b5150',x,.14,.28));
      } else if (id === 'md-shelf') {
        box(g, 1.75, .10, .38, '#a9aaa5', 0, .55, 0); box(g, 1.75, .10, .38, '#a9aaa5', 0, 1.15, 0); box(g, 1.75, .10, .38, '#a9aaa5', 0, 1.75, 0);
        [-.78,.78].forEach(x => box(g,.08,1.85,.34,'#777d7b',x,1.12,0));
      } else if (id === 'md-planter') {
        const pot = addMesh(g, new THREE.CylinderGeometry(.27,.4,.7,24), material('#d9d7cf',.7), [0,.4,0]);
        for(let i=0;i<7;i++){ const a=i*Math.PI*2/7; const leaf=sphere(g,.42,'#718b76',Math.cos(a)*.19,.95+Math.sin(i*1.7)*.12,Math.sin(a)*.19,[.32,1,.22]); leaf.rotation.z=Math.cos(a)*.5; }
      }
      return g;
    }
    function addChineseFurniture(root, id) {
      const g = new THREE.Group(); root.add(g); const wood = '#4c281a', wood2 = '#7b4228', gold = '#c6a15b';
      if (id === 'cn-daybed') {
        box(g, 2.45, .2, 1.0, wood, 0, .42, 0); box(g, 2.28, .16, .86, '#b88c66', 0, .61, .04);
        box(g, 2.4, .12, .13, wood2, 0, 1.08, -.42); box(g, .13, .75, .95, wood, -1.13, .76, 0); box(g, .13, .75, .95, wood, 1.13, .76, 0);
        [-.95,.95].forEach(x => { box(g, .14, .33, .14, wood, x, .18, -.35); box(g, .14, .33, .14, wood, x, .18, .35); });
        for (let i=-3;i<=3;i++) box(g,.035,.32,.035,gold,i*.3,.87,-.48);
      } else if (id === 'cn-tea') {
        cylinder(g, .66, .7, .16, wood2, 0, .78, 0, 40); cylinder(g, .38, .48, .5, wood, 0, .45, 0, 16);
        for (let i=0;i<4;i++) { const a=i*Math.PI/2+Math.PI/4; box(g,.11,.42,.11,wood,Math.cos(a)*.42,.22,Math.sin(a)*.42); }
        cylinder(g,.51,.51,.06,gold,0,.87,0,40);
      } else if (id === 'cn-shelf') {
        box(g,1.5,2.15,.15,wood,0,1.08,0);
        [-.68,.68].forEach(x => box(g,.12,2.15,.42,wood2,x,1.08,.02));
        [.35,.95,1.55,2.05].forEach(y => box(g,1.46,.09,.48,wood2,0,y,0));
        box(g,1.62,.1,.55,gold,0,2.18,0);
        [-.42,0,.42].forEach(x => box(g,.035,1.8,.04,gold,x,1.12,.12));
      } else if (id === 'cn-lantern') {
        cylinder(g,.2,.24,.1,wood,0,.05,0); cylinder(g,.045,.06,1.6,wood2,0,.88,0);
        box(g,.46,.55,.46,'#e7bd72',0,1.85,0); box(g,.52,.07,.52,wood,0,1.55,0); box(g,.55,.08,.55,wood,0,2.14,0);
        const roof = addMesh(g,new THREE.ConeGeometry(.42,.28,4),material(wood),[0,2.31,0]); roof.rotation.y=Math.PI/4;
      } else if (id === 'cn-stool') {
        cylinder(g,.43,.46,.16,'#d7c6a8',0,.63,0,32); cylinder(g,.39,.39,.42,wood,0,.35,0,24);
        cylinder(g,.48,.48,.08,gold,0,.74,0,32,.55);
      } else if (id === 'cn-screen') {
        [-.76,0,.76].forEach(x => box(g,.08,2.25,.12,wood,x,1.15,0));
        box(g,2.35,.10,.15,gold,0,2.27,0); box(g,2.35,.10,.15,gold,0,.06,0);
        for(let x=-.68;x<=.7;x+=.17) box(g,.025,2.0,.05,wood2,x,1.16,.03);
        box(g,2.2,.06,.08,gold,0,1.1,.04);
      } else if (id === 'cn-vase') {
        const vase = addMesh(g,new THREE.LatheGeometry([new THREE.Vector2(.06,0),new THREE.Vector2(.22,.12),new THREE.Vector2(.32,.48),new THREE.Vector2(.24,.82),new THREE.Vector2(.1,1.0),new THREE.Vector2(.09,1.18)],24),material('#315a68',.24,.12),[0,0,0]);
        vase.position.y=.05;
        cylinder(g,.12,.12,.07,gold,0,1.25,0,24,.55);
      }
      return g;
    }
    function addAmericanFurniture(root, id) {
      const g = new THREE.Group(); root.add(g); const wood='#805536', fabric='#d2c0a8', dark='#3e3934';
      if (id === 'us-sofa') {
        box(g,2.6,.55,1.05,fabric,0,.55,0); box(g,2.45,.78,.24,'#b6a18b',0,1.12,-.4);
        box(g,.32,.78,1.06,'#b6a18b',-1.14,.88,0); box(g,.32,.78,1.06,'#b6a18b',1.14,.88,0);
        [-.85,.85].forEach(x=>box(g,.13,.3,.13,wood,x,.15,.34));
        [-.65,.0,.65].forEach(x=>box(g,.48,.43,.13,'#e7dac7',x,1.19,-.22));
      } else if (id === 'us-table') {
        box(g,1.7,.16,1.0,wood,0,.86,0);
        [-.68,.68].forEach(x=>[-.37,.37].forEach(z=>box(g,.14,.78,.14,'#63452f',x,.42,z)));
        box(g,1.55,.09,.9,'#a7794e',0,.64,0);
        box(g,.22,.6,.9,wood,-.62,.37,0); box(g,.22,.6,.9,wood,.62,.37,0);
      } else if (id === 'us-chair') {
        box(g,.9,.38,.86,fabric,0,.48,0); box(g,.9,.9,.18,'#b6a18b',0,.95,-.34);
        box(g,.18,.58,.9,'#b6a18b',-.39,.77,0); box(g,.18,.58,.9,'#b6a18b',.39,.77,0);
        [-.3,.3].forEach(x=>box(g,.1,.28,.1,wood,x,.15,.3));
      } else if (id === 'us-lamp') {
        cylinder(g,.25,.3,.12,dark,0,.06,0); cylinder(g,.035,.045,1.55,dark,0,.9,0,12,.55);
        const shade=addMesh(g,new THREE.CylinderGeometry(.35,.19,.45,24,1,true),material('#e6d7bf'),[0,1.82,0]);
        cylinder(g,.08,.08,.08,'#d3b779',0,1.55,0,12,.55);
      } else if (id === 'us-sideboard') {
        box(g,1.95,.85,.58,'#805536',0,.78,0); box(g,2.05,.12,.66,'#a7794e',0,1.25,0);
        [-.55,0,.55].forEach(x=>{ box(g,.5,.62,.035,'#b6a18b',x,.78,.31); sphere(g,.035,'#d3b779',x+.18,.8,.35,[1,1,1]); });
        [-.78,.78].forEach(x=>box(g,.12,.24,.12,'#63452f',x,.12,.18));
      } else if (id === 'us-ottoman') {
        box(g,1.05,.42,.82,'#d2c0a8',0,.55,0);
        box(g,1.08,.10,.85,'#805536',0,.31,0);
        [-.4,.4].forEach(x=>[-.28,.28].forEach(z=>box(g,.08,.25,.08,'#63452f',x,.13,z)));
      } else if (id === 'us-bookshelf') {
        box(g,1.4,2.25,.18,'#805536',0,1.13,0); [-.62,.62].forEach(x=>box(g,.12,2.25,.42,'#a7794e',x,1.13,.05));
        [.35,.85,1.35,1.85,2.3].forEach(y=>box(g,1.32,.08,.42,'#805536',0,y,.06));
        for(let row=0;row<3;row++) for(let col=0;col<4;col++) box(g,.16,.28+((row+col)%2)*.12,.16,['#55706b','#8b5747','#d0b28c','#4c3b2d'][(row+col)%4],-.48+col*.32,.55+row*.55,.1);
      }
      return g;
    }
    function addEuropeanFurniture(root, id) {
      const g = new THREE.Group(); root.add(g); const gold='#b18b50', cream='#e4d5c1', velvet='#8c5a54';
      if (id === 'eu-sofa') {
        box(g,2.35,.48,.86,velvet,0,.55,0); box(g,2.3,.9,.2,velvet,0,1.05,-.34);
        box(g,.34,.72,.86,cream,-1.05,.86,0); box(g,.34,.72,.86,cream,1.05,.86,0);
        box(g,2.45,.08,.94,gold,0,.34,0);
        [-.82,.82].forEach(x=>{ cylinder(g,.06,.1,.34,gold,x,.18,.28,12,.6); sphere(g,.09,gold,x,.95,-.43,[1,.8,.55]); });
        for(let i=-3;i<=3;i++) sphere(g,.045,gold,i*.3,1.49,-.42,[1,1,.65]);
      } else if (id === 'eu-table') {
        cylinder(g,.62,.58,.13,'#e7e0d5',0,.85,0,40,.08); cylinder(g,.17,.28,.68,gold,0,.46,0,20,.65);
        cylinder(g,.42,.42,.08,gold,0,.1,0,32,.55); sphere(g,.12,gold,0,.84,0,[1,.35,1]);
      } else if (id === 'eu-cabinet') {
        box(g,1.45,2.15,.42,cream,0,1.08,0); box(g,1.28,1.92,.06,'#765448',0,1.12,.23);
        box(g,1.34,.12,.12,gold,0,2.18,.27); box(g,1.34,.12,.12,gold,0,.13,.27);
        [-.63,.63].forEach(x=>box(g,.08,2.08,.1,gold,x,1.08,.29));
        for(let y=.55;y<2;y+=.48) box(g,1.22,.06,.08,gold,0,y,.3);
        sphere(g,.08,gold,0,2.32,0,[1,.65,1]);
      } else if (id === 'eu-chandelier') {
        cylinder(g,.18,.18,.12,gold,0,2.35,0,18,.7); cylinder(g,.035,.035,.5,gold,0,2.62,0,12,.6);
        for(let i=0;i<5;i++){ const a=i*Math.PI*2/5; const x=Math.cos(a)*.68,z=Math.sin(a)*.68;
          tube(g,[[0,2.3,0],[x*.55,2.22,z*.55],[x,2.0,z]],.035,gold); sphere(g,.13,'#e9dfcc',x,1.95,z,[.8,1.2,.8]);
          cylinder(g,.05,.08,.18,'#fff0bd',x,1.78,z,12,.1);
        }
      } else if (id === 'eu-armchair') {
        box(g,1.08,.42,.88,'#8c5a54',0,.55,0); box(g,1.08,.86,.18,'#8c5a54',0,1.05,-.34);
        box(g,.17,.68,.84,'#e4d5c1',-.48,.8,0); box(g,.17,.68,.84,'#e4d5c1',.48,.8,0);
        [-.42,.42].forEach(x=>{ cylinder(g,.045,.06,.34,gold,x,.18,.3,12,.65); sphere(g,.08,gold,x,1.35,-.4,[1,.7,.6]); });
      } else if (id === 'eu-mirror') {
        box(g,1.05,1.85,.12,gold,0,1.05,0);
        const mirror=addMesh(g,new THREE.BoxGeometry(.82,1.58,.035),new THREE.MeshStandardMaterial({color:'#b7c6c9',metalness:.72,roughness:.16}),[0,1.08,.08]);
        const arch=addMesh(g,new THREE.SphereGeometry(.43,24,16,0,Math.PI*2,0,Math.PI/2),material(gold,.35,.65),[0,2.02,0]); arch.scale.set(1.2,.65,.14);
      } else if (id === 'eu-pouf') {
        cylinder(g,.47,.49,.44,'#8c5a54',0,.42,0,32,.05); cylinder(g,.5,.5,.09,'#b18b50',0,.67,0,32,.55);
        for(let i=0;i<8;i++){ const a=i*Math.PI/4; sphere(g,.035,'#b18b50',Math.cos(a)*.34,.67,Math.sin(a)*.34,[1,1,1]); }
      }
      return g;
    }
    const FURNITURE_COLOR_ROLES = {
      chinese: {
        '#4c281a': 'main', '#7b4228': 'main', '#b88c66': 'fabric', '#c6a15b': 'detail', '#d7c6a8': 'fabric', '#315a68': 'detail'
      },
      american: {
        '#805536': 'main', '#63452f': 'main', '#a7794e': 'main',
        '#d2c0a8': 'fabric', '#b6a18b': 'fabric', '#e7dac7': 'fabric', '#e6d7bf': 'fabric',
        '#3e3934': 'detail', '#d3b779': 'detail', '#b6a18b': 'fabric', '#d2c0a8': 'fabric', '#805536': 'main', '#a7794e': 'main', '#e7dac7': 'fabric', '#4c3b2d': 'detail'
      },
      european: {
        '#b18b50': 'detail', '#e4d5c1': 'fabric', '#8c5a54': 'main', '#e7e0d5': 'main', '#d8c9b6': 'fabric', '#765448': 'main', '#e9dfcc': 'fabric'
      },
      modern: {
        '#aeb4b2': 'main', '#9da5a3': 'main', '#d9d7cf': 'main', '#a9aaa5': 'main',
        '#d5d7d1': 'fabric', '#eee5d5': 'fabric', '#899391': 'detail', '#484b4a': 'detail',
        '#777d7b': 'detail', '#555b5a': 'detail', '#5c625f': 'detail', '#4b5150': 'detail',
        '#4d5553': 'detail', '#f8e6ab': 'detail', '#c9ccc7': 'fabric', '#777d7b': 'detail', '#d9d7cf': 'main'
      }
    };
    const FURNITURE_DEFAULT_COLORS = {
      chinese: { main: '#4c281a', fabric: '#b88c66', detail: '#c6a15b' },
      american: { main: '#805536', fabric: '#d2c0a8', detail: '#3e3934' },
      european: { main: '#8c5a54', fabric: '#e4d5c1', detail: '#b18b50' },
      modern: { main: '#aeb4b2', fabric: '#d5d7d1', detail: '#4b5150' }
    };
    let selectionBox = null;
    let furnitureRaycaster = null;
    let pointerNdc = null;

    function buildFurniture(item, index) {
      const root = new THREE.Group();
      const styleKey = item.id.startsWith('cn-') ? 'chinese' : item.id.startsWith('us-') ? 'american' : item.id.startsWith('eu-') ? 'european' : 'modern';
      activeFurnitureColorMap = { roleByBase: FURNITURE_COLOR_ROLES[styleKey] || {}, colors: item.colors || {} };
      if (styleKey === 'chinese') addChineseFurniture(root, item.id);
      else if (styleKey === 'american') addAmericanFurniture(root, item.id);
      else if (styleKey === 'european') addEuropeanFurniture(root, item.id);
      else addModernFurniture(root, item.id);
      activeFurnitureColorMap = null;
      root.position.set(item.x ?? 0, 0, item.z ?? 0); root.rotation.y = item.rotation || 0; root.scale.setScalar(item.scale || 1);
      root.userData.itemId = item.id; root.userData.itemIndex = index;
      return root;
    }
    function clearFurnitureSelection() {
      if (selectionBox && scene) scene.remove(selectionBox);
      if (selectionBox) { selectionBox.geometry?.dispose(); selectionBox.material?.dispose(); }
      selectionBox = null;
    }
    function selectFurnitureAt(event) {
      if (!renderer || !camera || !roomRoot) return;
      const artHit = findWallArtAt(event);
      if (artHit) {
        const art = (state.room.wallArts[state.room.currentRoom] || []).find(item => item.id === artHit.id);
        if (art) {
          state.room.selectedWallArtId = art.id; state.room.selectedFurnitureIndex = -1; clearFurnitureSelection();
          renderWallArtControls(); renderRoom3D(); toast(`已选中墙贴：${art.name}`); return;
        }
      }
      setRayFromEvent(event);
      const hits = furnitureRaycaster.intersectObjects(roomRoot.children, true);
      let furnitureRoot = null;
      for (const hit of hits) {
        let node = hit.object;
        while (node && node !== roomRoot && node.userData.itemIndex === undefined) node = node.parent;
        if (node && node !== roomRoot && node.userData.itemIndex !== undefined) { furnitureRoot = node; break; }
      }
      state.room.selectedWallArtId = null;
      if (!furnitureRoot) {
        state.room.selectedFurnitureIndex = -1; clearFurnitureSelection(); renderColorControls(); renderWallArtControls();
        return;
      }
      state.room.selectedFurnitureIndex = furnitureRoot.userData.itemIndex;
      clearFurnitureSelection(); selectionBox = new window.THREE.BoxHelper(furnitureRoot, 0xe6a33b); scene.add(selectionBox);
      renderColorControls(); renderWallArtControls();
      const item = state.room.furniture[state.room.currentRoom][state.room.selectedFurnitureIndex];
      toast(`已选中：${FURNITURE[state.room.currentStyle]?.find(x => x.id === item.id)?.name || '家具'}，可调整主体、布料和细节颜色`);
    }
    function disposeRoomObjects(root) {
      root.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(item => item.dispose());
        }
      });
      root.clear();
    }
    function renderRoom3D() {
      if (!roomInitialized || !roomRoot || !renderer || !scene) {
        if (document.getElementById('roomFallbackCanvas').style.display !== 'none') renderFallbackRoom();
        return;
      }
      clearFurnitureSelection(); disposeRoomObjects(roomRoot); createRoomShell();
      const furniture = state.room.furniture[state.room.currentRoom] || [];
      furniture.forEach((item, index) => roomRoot.add(buildFurniture(item, index)));
      const selected = furniture[state.room.selectedFurnitureIndex];
      if (selected) {
        const selectedRoot = roomRoot.children.find(child => child.userData.itemIndex === state.room.selectedFurnitureIndex);
        if (selectedRoot) { selectionBox = new window.THREE.BoxHelper(selectedRoot, 0xe6a33b); scene.add(selectionBox); }
      }
      updateRoomCamera();
    }
    function getSelectedFurniture() {
      const list = state.room.furniture[state.room.currentRoom] || [];
      return list[state.room.selectedFurnitureIndex] || null;
    }
    function getSelectedWallArt() {
      const list = state.room.wallArts?.[state.room.currentRoom] || [];
      return list.find(item => item.id === state.room.selectedWallArtId) || null;
    }
    function syncWallArtSliders(art = getSelectedWallArt()) {
      if (!art) return;
      const x = document.getElementById('wallArtX'), y = document.getElementById('wallArtY');
      const width = document.getElementById('wallArtWidth'), rotation = document.getElementById('wallArtRotation');
      if (x) x.value = Math.round((art.x || 0) * 100);
      if (y) y.value = Math.round((art.y ?? 2) * 100);
      if (width) width.value = Math.round((art.width || 1.8) * 100);
      if (rotation) rotation.value = art.rotation || 0;
    }
    function renderWallArtControls() {
      const wallSelect = document.getElementById('wallArtWall');
      const modeSelect = document.getElementById('wallArtMode');
      const listNode = document.getElementById('wallArtList');
      const adjust = document.getElementById('wallArtAdjust');
      const active = getSelectedWallArt();
      wallSelect.value = active?.wall || state.room.wallArtWall || 'backWall';
      modeSelect.value = active?.mode || state.room.wallArtMode || 'sticker';
      listNode.innerHTML = '';
      const arts = state.room.wallArts?.[state.room.currentRoom] || [];
      if (!arts.length) {
        const empty = document.createElement('span'); empty.className = 'wall-art-empty'; empty.textContent = '还没有添加墙面图案。可以从主题素材库选择，也可以上传自己的图片。'; listNode.appendChild(empty);
      } else {
        arts.forEach(art => {
          const button = document.createElement('button'); button.type = 'button'; button.className = `wall-art-item${art.id === state.room.selectedWallArtId ? ' active' : ''}`;
          const thumb = document.createElement('img');
          thumb.src = wallArtAssets.get(art.assetId || art.id) || ''; thumb.alt = ''; thumb.style.cssText = 'width:30px;height:30px;object-fit:contain;border-radius:6px;background:#f2ebdf;flex:none;';
          const name = document.createElement('span'); name.textContent = `${art.name} · ${art.wall === 'sideWall' ? '左墙' : '后墙'}${art.mode === 'wallpaper' ? ' · 整面' : ''}`;
          button.append(thumb, name);
          button.addEventListener('click', () => { state.room.selectedWallArtId = art.id; state.room.selectedFurnitureIndex = -1; state.room.wallArtWall = art.wall; renderWallArtControls(); renderRoom3D(); saveRoom(); });
          listNode.appendChild(button);
        });
      }
      adjust.hidden = !active;
      const duplicate = document.getElementById('wallArtDuplicate');
      if (duplicate) duplicate.disabled = !active;
      if (active) {
        syncWallArtSliders(active);
        const disabled = active.mode === 'wallpaper';
        ['wallArtX','wallArtY','wallArtWidth','wallArtRotation'].forEach(id => { document.getElementById(id).disabled = disabled; });
      }
    }
    function renderStickerLibrary() {
      const theme = document.getElementById('stickerTheme').value;
      const node = document.getElementById('wallStickerGrid');
      node.innerHTML = '';
      const items = STICKER_CATALOG[theme] || [];
      if (!items.length) {
        const empty = document.createElement('span'); empty.className = 'wall-sticker-empty'; empty.textContent = '当前主题暂无可用素材。'; node.appendChild(empty); return;
      }
      items.forEach(asset => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'wall-sticker-card';
        button.title = `添加${asset.name}`;
        const img = document.createElement('img'); img.src = asset.path; img.alt = asset.name; img.loading = 'lazy';
        const label = document.createElement('span'); label.textContent = asset.sheet ? '整组贴纸' : asset.name.split('·').pop().trim();
        button.append(img, label);
        button.addEventListener('click', () => addStickerAsset(asset));
        node.appendChild(button);
      });
    }
    async function addStickerAsset(asset) {
      try {
        const response = await fetch(asset.path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const fileName = `${STICKER_THEME_NAMES[document.getElementById('stickerTheme').value]}_${asset.sheet ? '整组贴纸' : asset.path.split('/').pop()}`;
        const file = new File([blob], fileName, { type: blob.type || 'image/png' });
        document.getElementById('wallArtMode').value = 'sticker'; state.room.wallArtMode = 'sticker';
        await addWallArt(file);
      } catch (error) {
        console.error('读取内置墙贴素材失败：', error); toast('素材读取失败，请使用本地服务器打开项目');
      }
    }
    async function addWallArt(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) { toast('请选择图片文件'); return; }
      if (file.size > 15 * 1024 * 1024) { toast('图片请控制在 15MB 以内'); return; }
      let aspect = 1;
      try { const bitmap = await createImageBitmap(file); aspect = bitmap.width / Math.max(1, bitmap.height); bitmap.close(); }
      catch (error) { console.warn('无法读取图片尺寸，使用正方形比例：', error); }
      const wall = document.getElementById('wallArtWall').value;
      const mode = document.getElementById('wallArtMode').value;
      const id = `wallart_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const record = { id, name: file.name, blob: file, createdAt: Date.now() };
      try { await dbRequest('wallArt', 'readwrite', 'put', record); }
      catch (error) { console.error('保存墙面图案失败：', error); toast('保存失败，请检查浏览器存储空间'); return; }
      wallArtAssets.set(id, URL.createObjectURL(file));
      const roomArts = state.room.wallArts[state.room.currentRoom];
      const stickerIndex = roomArts.filter(item => item.mode !== 'wallpaper').length;
      const slots = [
        { x: 0, y: 2.05 }, { x: -1.55, y: 2.85 }, { x: 1.55, y: 2.85 },
        { x: -1.55, y: 1.15 }, { x: 1.55, y: 1.15 }, { x: 0, y: 3.25 }, { x: 0, y: .85 }
      ];
      const slot = slots[stickerIndex % slots.length];
      const defaultWidth = Math.min(1.8, Math.max(.42, aspect >= 1 ? 1.55 : 1.3 * aspect));
      const art = { id, assetId: id, name: file.name, wall, mode, x: mode === 'wallpaper' ? 0 : slot.x, y: mode === 'wallpaper' ? 2 : slot.y, width: defaultWidth, rotation: 0, aspect };
      roomArts.push(art);
      state.room.wallArtWall = wall; state.room.wallArtMode = mode; state.room.selectedWallArtId = id; state.room.selectedFurnitureIndex = -1;
      saveRoom(); renderWallArtControls(); renderRoom3D(); toast(mode === 'wallpaper' ? '整面壁纸已添加' : '墙贴已添加，可以直接拖动它');
    }
    function duplicateSelectedWallArt() {
      const art = getSelectedWallArt(); if (!art) return;
      const copy = { ...art, id: `wallart_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, assetId: art.assetId || art.id,
        name: `${art.name} 副本`, x: Math.max(-3.5, Math.min(3.5, (art.x || 0) + .38)), y: Math.max(.35, Math.min(3.65, (art.y ?? 2) - .28)) };
      state.room.wallArts[state.room.currentRoom].push(copy); state.room.selectedWallArtId = copy.id;
      saveRoom(); renderWallArtControls(); renderRoom3D(); toast('已复制墙贴，可以单独移动和调整');
    }
    async function deleteSelectedWallArt() {
      const art = getSelectedWallArt(); if (!art) return;
      if (!confirm(`删除墙面图案「${art.name}」？`)) return;
      const assetId = art.assetId || art.id;
      state.room.wallArts[state.room.currentRoom] = state.room.wallArts[state.room.currentRoom].filter(item => item.id !== art.id);
      const stillUsed = ['living','bedroom','bathroom'].some(room => (state.room.wallArts[room] || []).some(item => (item.assetId || item.id) === assetId));
      if (!stillUsed) {
        await dbRequest('wallArt', 'readwrite', 'delete', assetId).catch(error => console.warn('删除图案记录失败：', error));
        const url = wallArtAssets.get(assetId); if (url) URL.revokeObjectURL(url); wallArtAssets.delete(assetId);
        const texture = wallArtTextures.get(assetId); if (texture) texture.dispose(); wallArtTextures.delete(assetId);
      }
      state.room.selectedWallArtId = null; saveRoom(); renderWallArtControls(); renderRoom3D(); toast('墙面图案已删除');
    }
    function updateSelectedWallArt(field, value) {
      const art = getSelectedWallArt(); if (!art || art.mode === 'wallpaper') return;
      art[field] = value;
      saveRoom(); renderRoom3D();
    }
    function getTargetColor(target) {
      if (['backWall', 'sideWall', 'floor', 'trim'].includes(target)) return getCurrentSurfaceColors()[target];
      const item = getSelectedFurniture();
      if (!item) return '#c7b39a';
      const styleKey = item.id.startsWith('cn-') ? 'chinese' : item.id.startsWith('us-') ? 'american' : item.id.startsWith('eu-') ? 'european' : 'modern';
      return item.colors?.[target] || FURNITURE_DEFAULT_COLORS[styleKey]?.[target] || '#c7b39a';
    }
    function renderColorControls() {
      const target = document.getElementById('paintTarget').value;
      state.room.colorTarget = target;
      const selected = getSelectedFurniture();
      const colorInput = document.getElementById('customRoomColor');
      const hex = getTargetColor(target);
      colorInput.value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#c7b39a';
      document.getElementById('colorHexValue').textContent = colorInput.value.toUpperCase();
      const hint = document.getElementById('paintTargetHint');
      if (['main', 'fabric', 'detail'].includes(target)) {
        const itemName = selected ? (FURNITURE[state.room.currentStyle]?.find(x => x.id === selected.id)?.name || '已选家具') : '';
        hint.textContent = selected ? `正在调整「${itemName}」的${target === 'main' ? '主体' : target === 'fabric' ? '布料 / 软装' : '装饰 / 金属细节'}颜色。只影响这件家具。` : '请先在上方 3D 场景中点击一件家具，出现金色选中框后即可调整它的颜色。';
      } else {
        const names = { backWall: '后墙', sideWall: '左侧墙', floor: '地板', trim: '门框 / 踢脚线 / 装饰线' };
        hint.textContent = `正在调整${names[target]}。可以使用左侧预设色，也可以点击取色器选择任意颜色。`;
      }
      document.querySelectorAll('.paint-swatch').forEach(button => button.classList.toggle('active', button.dataset.color.toLowerCase() === colorInput.value.toLowerCase()));
    }
    function renderHouseControls() {
      document.querySelectorAll('.room-tab').forEach(button => button.classList.toggle('active', button.dataset.room === state.room.currentRoom));
      document.querySelectorAll('.style-btn').forEach(button => button.classList.toggle('active', button.dataset.style === state.room.currentStyle));
      document.getElementById('paintTarget').value = state.room.colorTarget || 'backWall';
      const palette = document.getElementById('furniturePalette'); palette.innerHTML = '';
      const items = FURNITURE[state.room.currentStyle] || [];
      if (!items.length) {
        palette.innerHTML = '<span class="hint">毛坯空间暂不摆放风格家具。选择中式、美式、欧式或现代风格后，会显示对应家具。</span>';
      } else {
        items.forEach(item => {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'furniture-btn';
          button.innerHTML = `<span class="furn-symbol">${item.symbol}</span><b>${item.name}</b>`;
          button.addEventListener('click', () => addFurniture(item)); palette.appendChild(button);
        });
      }
      renderColorControls();
      renderWallArtControls();
    }
    function addFurniture(item) {
      const current = state.room.furniture[state.room.currentRoom];
      const index = current.length, columns = 3, col = index % columns, row = Math.floor(index / columns);
      current.push({ id: item.id, x: -2.15 + col * 2.0, z: 1.8 - row * 1.45, rotation: 0, colors: {} });
      state.room.selectedFurnitureIndex = current.length - 1; state.room.selectedWallArtId = null;
      saveRoom(); renderHouseControls(); renderRoom3D(); toast(`${item.name}已摆放，可以继续调整颜色`);
    }
    function applyRoomColor(color) {
      if (!/^#[0-9a-f]{6}$/i.test(color)) return;
      const target = document.getElementById('paintTarget').value;
      if (['backWall', 'sideWall', 'floor', 'trim'].includes(target)) {
        const surfaces = state.room.surfaces[state.room.currentRoom] || (state.room.surfaces[state.room.currentRoom] = {});
        surfaces[target] = color;
        if (target === 'backWall') state.room.wallColor = color;
      } else {
        const item = getSelectedFurniture();
        if (!item) { toast('请先在 3D 场景中点击选中一件家具'); renderColorControls(); return; }
        item.colors = item.colors || {}; item.colors[target] = color;
      }
      saveRoom(); renderColorControls(); renderRoom3D();
    }
    document.querySelectorAll('.room-tab').forEach(button => button.addEventListener('click', () => {
      state.room.currentRoom = button.dataset.room; state.room.selectedFurnitureIndex = -1; state.room.selectedWallArtId = null; state.room.selectedPhotoFurnitureId = null; clearFurnitureSelection();
      saveRoom(); renderHouseControls(); f3dRenderPalette();
      if (f3d.ready) {
        f3dBuildRoom(); f3dRenderFurniture();
        if (f3d.mode === 'walk') { f3dClearGhost(); f3d.walk.x = 0; f3d.walk.z = 2.5; f3d.walk.yaw = 0; f3dBuildShell(); f3dUpdateHud(); fpRenderDecor(); }
      }
      renderRoom3D();
    }));
    document.querySelectorAll('.style-btn').forEach(button => button.addEventListener('click', () => {
      const oldStyle = state.room.currentStyle;
      const surfaces = state.room.surfaces[state.room.currentRoom] || (state.room.surfaces[state.room.currentRoom] = {});
      const oldLook = STYLE_LOOK[oldStyle] || STYLE_LOOK.raw, newLook = STYLE_LOOK[button.dataset.style] || STYLE_LOOK.raw;
      // 仅当某项仍在使用旧风格默认色时，切换风格才自动采用新风格的默认色。
      ['backWall', 'sideWall', 'floor', 'trim'].forEach(key => {
        if (!surfaces[key] || surfaces[key].toLowerCase() === ({ backWall: oldLook.wall, sideWall: oldLook.wall, floor: oldLook.floor, trim: oldLook.trim })[key].toLowerCase()) delete surfaces[key];
      });
      state.room.currentStyle = button.dataset.style; state.room.selectedFurnitureIndex = -1; state.room.selectedWallArtId = null;
      saveRoom(); renderHouseControls(); renderRoom3D();
    }));
    document.getElementById('paintTarget').addEventListener('change', event => {
      state.room.colorTarget = event.target.value; saveRoom(); renderColorControls();
    });
    document.querySelectorAll('.paint-swatch').forEach(button => button.addEventListener('click', () => applyRoomColor(button.dataset.color)));
    document.getElementById('customRoomColor').addEventListener('input', event => {
      document.getElementById('colorHexValue').textContent = event.target.value.toUpperCase();
    });
    document.getElementById('customRoomColor').addEventListener('change', event => applyRoomColor(event.target.value));
    document.getElementById('wallArtWall').addEventListener('change', event => {
      state.room.wallArtWall = event.target.value;
      const selected = getSelectedWallArt(); if (selected) selected.wall = event.target.value;
      saveRoom(); renderWallArtControls(); renderRoom3D();
    });
    document.getElementById('wallArtMode').addEventListener('change', event => { state.room.wallArtMode = event.target.value; saveRoom(); });
    document.getElementById('wallArtUpload').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []); event.target.value = '';
      for (const file of files) await addWallArt(file);
    });
    document.getElementById('wallArtDelete').addEventListener('click', deleteSelectedWallArt);
    document.getElementById('wallArtDuplicate').addEventListener('click', duplicateSelectedWallArt);
    document.getElementById('stickerTheme').addEventListener('change', renderStickerLibrary);
    renderStickerLibrary();
    document.getElementById('wallArtReset').addEventListener('click', () => {
      const art = getSelectedWallArt(); if (!art) return;
      art.x = 0; art.y = 2; art.width = 1.8; art.rotation = 0;
      saveRoom(); renderWallArtControls(); renderRoom3D();
    });
    document.getElementById('wallArtX').addEventListener('input', event => updateSelectedWallArt('x', Number(event.target.value) / 100));
    document.getElementById('wallArtY').addEventListener('input', event => updateSelectedWallArt('y', Number(event.target.value) / 100));
    document.getElementById('wallArtWidth').addEventListener('input', event => updateSelectedWallArt('width', Number(event.target.value) / 100));
    document.getElementById('wallArtRotation').addEventListener('input', event => updateSelectedWallArt('rotation', Number(event.target.value)));
    document.getElementById('clearFurniture').addEventListener('click', () => {
      if (!confirm('清空当前房间里的所有家具？')) return;
      state.room.furniture[state.room.currentRoom] = []; state.room.selectedFurnitureIndex = -1;
      state.room.photoFurniture[state.room.currentRoom] = []; state.room.selectedPhotoFurnitureId = null;
      state.room.f3d[state.room.currentRoom] = []; f3d.selectedId = null;
      saveRoom(); if (f3d.ready) f3dRenderFurniture(); renderRoom3D(); renderColorControls(); toast('当前房间已清空');
    });
    document.getElementById('deleteSelectedFurniture').addEventListener('click', () => {
      const list = state.room.furniture[state.room.currentRoom] || [];
      const index = state.room.selectedFurnitureIndex;
      if (index < 0 || !list[index]) return toast('请先在 3D 场景中点击选中一件家具');
      list.splice(index, 1);
      state.room.selectedFurnitureIndex = -1;
      clearFurnitureSelection(); saveRoom(); renderRoom3D(); renderColorControls();
      toast('家具已删除');
    });
    document.getElementById('resetRoomView').addEventListener('click', () => {
      roomYaw = Math.PI / 4; roomPitch = .32; roomDistance = 11.7; updateRoomCamera();
    });


    // -------------------- 天气与自动昼夜系统 --------------------
    const ENV_KEY = 'love_house_environment_v1';
    const environment = { weather: 'sunny', timeMode: 'auto', speed: 1 };
    const environmentStartAt = performance.now();
    const environmentStartHour = 10; // 初次进入固定从白天 10:00 起步
    let environmentParticlesBuiltFor = '';
    function loadEnvironment() {
      const saved = safeParse(ENV_KEY, null);
      if (saved && typeof saved === 'object') {
        if (['sunny','cloudy','rain','snow','fog'].includes(saved.weather)) environment.weather = saved.weather;
        if (['auto','day','night'].includes(saved.timeMode)) environment.timeMode = saved.timeMode;
        if ([.5,1,2,4].includes(Number(saved.speed))) environment.speed = Number(saved.speed);
      }
    }
    function saveEnvironment() { localStorage.setItem(ENV_KEY, JSON.stringify(environment)); }
    function fillEnvironmentPanel() {
      document.getElementById('weatherSelect').value = environment.weather;
      document.getElementById('timeModeSelect').value = environment.timeMode;
      document.getElementById('timeSpeedSelect').value = String(environment.speed);
      updateEnvironment(performance.now());
    }
    function setWeather(weather) {
      if (!['sunny','cloudy','rain','snow','fog'].includes(weather)) return;
      environment.weather = weather; saveEnvironment(); buildWeatherParticles(); updateEnvironment(performance.now());
    }
    function buildWeatherParticles() {
      const layer = document.getElementById('weatherLayer'); layer.innerHTML = '';
      environmentParticlesBuiltFor = environment.weather;
      const count = environment.weather === 'rain' ? 48 : environment.weather === 'snow' ? 34 : environment.weather === 'cloudy' ? 5 : 0;
      for (let i=0;i<count;i++) {
        const el=document.createElement('span');
        if (environment.weather==='rain') el.className='weather-particle rain';
        else if (environment.weather==='snow') el.className='weather-particle snow';
        else el.className='weather-particle cloud';
        el.style.left=`${Math.random()*108-4}%`;
        el.style.setProperty('--duration',`${environment.weather==='rain'?1.4+Math.random()*1.5:environment.weather==='snow'?7+Math.random()*8:30+Math.random()*25}s`);
        el.style.setProperty('--delay',`${-Math.random()*18}s`);
        el.style.setProperty('--drift',`${-60+Math.random()*120}px`);
        el.style.setProperty('--y',`${5+Math.random()*44}%`);
        el.style.opacity=String(.35+Math.random()*.5);
        layer.appendChild(el);
      }
    }
    const nightBackdrop = document.getElementById('nightBackdrop');
    const indoorFigures = document.getElementById('indoorFigures');
    function currentEnvironmentHour(now) {
      if (environment.timeMode==='day') return 12;
      if (environment.timeMode==='night') return 22;
      const cycleDuration=24*60*1000/environment.speed;
      return (environmentStartHour + ((now-environmentStartAt)/cycleDuration)*24) % 24;
    }
    // 连续的夜色强度：驱动真实夜景照片交叉淡入，而非黑色图层
    function currentNightFactor(now = performance.now()) {
      if (environment.timeMode==='day') return 0;
      if (environment.timeMode==='night') return 1;
      const hour = currentEnvironmentHour(now);
      if (hour>=20 || hour<5) return 1;
      if (hour>=17) return (hour-17)/3;
      if (hour>=5 && hour<7) return (7-hour)/2*.6;
      return 0;
    }
    let lastEnvironmentSignature = '';
    function updateEnvironment(now) {
      const hour=currentEnvironmentHour(now), app=document.getElementById('app');
      const hh=Math.floor(hour), mm=Math.floor((hour-hh)*60);
      const timeText=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
      let phase='day',phaseText='白天';
      if (environment.timeMode==='night' || hour>=20 || hour<5) { phase='night'; phaseText='夜晚'; }
      else if (hour>=17 && hour<20) { phase='dusk'; phaseText='黄昏'; }
      else if (hour>=5 && hour<7) { phase='dawn'; phaseText='清晨'; }
      if (app.dataset.time!==phase) {
        app.dataset.time=phase;
        if (hoverState.shape) { buildHoverCrop(hoverState.shape); paintHover(); }
      }
      if (app.dataset.weather!==environment.weather) app.dataset.weather=environment.weather;
      const nightFactor=currentNightFactor(now);
      if (nightFactor>0) ensureNightBackground();
      nightBackdrop.style.opacity=nightFactor.toFixed(3);
      indoorFigures.style.opacity=Math.min(1, nightFactor*1.25).toFixed(3);
      const signature=`${phase}|${environment.weather}|${timeText}`;
      if (signature!==lastEnvironmentSignature) {
        lastEnvironmentSignature=signature;
        const weatherNames={sunny:'晴天',cloudy:'多云',rain:'小雨',snow:'飘雪',fog:'薄雾'};
        const icons={sunny:'☀️',cloudy:'☁️',rain:'🌧️',snow:'❄️',fog:'🌫️'};
        document.getElementById('environmentChip').textContent=`${phase==='night'?'🌙':phase==='dusk'?'🌇':phase==='dawn'?'🌅':icons[environment.weather]} ${phaseText} ${timeText}`;
        const desc=phase==='night'?'夜色降临，草坪上的躺椅空了出来，两人回到亮着暖灯的屋内。':phase==='dusk'?'夕阳渐落，河面泛起暖金色光。':phase==='dawn'?'天色渐亮，晨雾与微光铺满河谷。':'河面微光流动，树叶随风轻摆。';
        const status=document.getElementById('environmentStatus');
        if(status) status.innerHTML=`${icons[environment.weather]} ${weatherNames[environment.weather]} · ${phaseText} ${timeText}<br>${desc}`;
      }
      if(environmentParticlesBuiltFor!==environment.weather) buildWeatherParticles();
      // 别墅内的真实昼夜光影：太阳方位、阴影方向、室内暖灯全部跟随
      if (window.VillaBridge && window.VillaBridge.isReady()) {
        window.VillaBridge.syncEnvironment();
      }
    }
    document.getElementById('weatherSelect').addEventListener('change',e=>setWeather(e.target.value));
    document.getElementById('timeModeSelect').addEventListener('change',e=>{environment.timeMode=e.target.value;saveEnvironment();updateEnvironment(performance.now());});
    document.getElementById('timeSpeedSelect').addEventListener('change',e=>{environment.speed=Number(e.target.value)||1;saveEnvironment();});
    document.getElementById('setDayNow').addEventListener('click',()=>{environment.timeMode='day';saveEnvironment();fillEnvironmentPanel();toast('已切换到白天');});
    document.getElementById('setNightNow').addEventListener('click',()=>{environment.timeMode='night';saveEnvironment();fillEnvironmentPanel();toast('夜色降临，两人已回到屋内');});
    document.getElementById('resumeTimeCycle').addEventListener('click',()=>{environment.timeMode='auto';saveEnvironment();fillEnvironmentPanel();toast('已恢复自动昼夜交替');});
    function animateEnvironment(now) { updateEnvironment(now); requestAnimationFrame(animateEnvironment); }
    document.getElementById('retryThreeBtn').addEventListener('click', async () => {
      const box=document.getElementById('threeError'); box.firstChild.textContent='正在重新连接 3D 引擎… ';
      window.__threeLoadPromise = new Promise(resolve => {
        const sources=['https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','https://unpkg.com/three@0.128.0/build/three.min.js','https://cdn.bootcdn.net/ajax/libs/three.js/0.128.0/three.min.js','https://lib.baomitu.com/three.js/0.128.0/three.min.js','https://cdnjs.cloudflare.com/ajax/libs/three.js/0.128.0/three.min.js','https://raw.githubusercontent.com/mrdoob/three.js/r128/build/three.min.js'];
        let i=0; const next=()=>{if(window.THREE){resolve(true);return;}if(i>=sources.length){resolve(false);return;}const sc=document.createElement('script');sc.src=sources[i++];sc.onload=()=>resolve(!!window.THREE);sc.onerror=()=>next();document.head.appendChild(sc);}; next();
      });
      const ok=await window.__threeLoadPromise; if(ok){THREE=window.THREE;roomInitialized=false;document.getElementById('room3dCanvas').style.display='block';document.getElementById('roomFallbackCanvas').style.display='none';initRoom3D();renderRoom3D();toast('3D 房间已连接');} else {showRoomFallback('仍无法连接外部 3D 引擎，继续使用兼容预览。');toast('备用线路仍不可用');}
    });

    // -------------------- 启动 --------------------
    (async function init() {
      // 服务端模式（Java 部署）会先挂上 __serverStateReady：等服务器状态拉回来再读本地，
      // 保证「双方各自设备都能看到对方状态」在刷新后依然成立。静态站没有这个钩子，直接跳过。
      if (window.__serverStateReady && typeof window.__serverStateReady.then === 'function') {
        try { await window.__serverStateReady; } catch (_) {}
      }
      try {
        const dbOk = await openDB();
        if (!dbOk) {
          restoreFallbackStores();
          toast('当前环境未开放 IndexedDB，照片会自动压缩后保存在本机；视频仅本次观看有效');
        }
        await loadMedia();
      } catch (error) {
        console.error('本地媒体初始化失败，已切换到会话存储：', error);
        db = null; mediaFallback = true; restoreFallbackStores(); await loadMedia();
      }
      loadPets(); loadRoom(); loadProfile(); loadBottles(); loadMenu(); loadOrders(); loadSettings(); loadEnvironment(); buildWeatherParticles();
      try { await loadWallArtAssets(); } catch (error) { console.warn('墙面素材恢复失败：', error); }
      await loadRoomAssets();
      createBottleNodes(); resizeBottleCanvas(); window.addEventListener('resize', resizeBottleCanvas);
      // 初始化房间编辑器（三维场景在打开房屋面板时按需搭建）
      renderHouseControls(); f3dRenderPalette(); updateStyleControls();
      requestAnimationFrame(animateBottles); requestAnimationFrame(animateEnvironment); updateProfileUI();
      renderRiverPanel();
      updateMenuButton(); startOrderSync(); handleIncomingOrderLink();
      renderMenuTabs();

      // ===== 账号优先：先恢复云端会话，再决定是否显示登录 / 角色绑定 =====
      try {
        const restored = await AH.restore();
        if (restored) {
          // 已登录：把云端角色同步到本机
          const acc = AH.account;
          if (acc.profile && acc.profile.gender) {
            state.profile = { name: acc.profile.nickname || acc.user?.name || '我', gender: acc.profile.gender };
            saveProfile();
          }
          updateProfileUI();
          updateSettingsAccountUI();
          await syncOrdersFromCloud();
          showAccountGate(false);
          if (!state.profile || !state.profile.name || !['male', 'female'].includes(state.profile.gender)) showProfileGate(true);
          else setTimeout(() => toast('欢迎回到恋爱小屋，河面上有新的漂流瓶'), 500);
        } else {
          // 未登录：显示账号门
          fillAccountForm();
          setAccountMode('login');
          showAccountGate(true);
          const offline = document.getElementById('accountOffline');
          const acc = AH.account;
          if (offline) {
            if (acc && !acc.online) {
              offline.style.display = 'block';
              offline.textContent = '云端服务暂时连不上，可以先用「离线体验」进入小屋，订单会保存在本机，联网后再同步。';
            } else {
              offline.style.display = 'block';
              offline.textContent = '登录后，订单、角色和装修会在你们两个人的设备之间自动同步 💕';
            }
          }
        }
      } catch (error) {
        console.warn('[账号] 初始化失败，进入离线模式', error);
        fillAccountForm();
        setAccountMode('login');
        showAccountGate(true);
      }
    })();
  