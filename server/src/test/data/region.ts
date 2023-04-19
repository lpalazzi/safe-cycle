import mongoose from 'mongoose';
import { IRegion } from 'interfaces';
import { RegionModel } from 'models';

export const createTestRegion = async (
  contributors?: mongoose.Types.ObjectId[]
) => {
  const createdRegion: IRegion = await RegionModel.create({
    _id: new mongoose.Types.ObjectId(),
    name: 'Windsor-Essex County',
    iso31662: 'CA-ON',
    contributors: contributors ?? [],
    polygon: {
      type: 'Polygon',
      coordinates: [
        [
          [-83.1496944, 42.041],
          [-83.1488244, 42.0390871],
          [-83.143956, 42.02793],
          [-83.1312632, 42.0004645],
          [-83.0769667466887, 41.9625687770085],
          [-83.035379777815, 41.941242220404],
          [-82.8581518268229, 41.9368875182964],
          [-82.822345045694, 41.9391606650482],
          [-82.6375094516554, 41.9680526743833],
          [-82.5442235175491, 41.9192231818255],
          [-82.4984020523182, 41.8737930095752],
          [-82.4698, 42],
          [-82.4653732, 42.0591463],
          [-82.4653197, 42.0598609],
          [-82.4652118, 42.061591],
          [-82.4647203, 42.0694669],
          [-82.4646045, 42.0708437],
          [-82.4639592, 42.080064],
          [-82.4639131, 42.0806087],
          [-82.4634355, 42.0872784],
          [-82.4636303, 42.0872819],
          [-82.4636426, 42.0872907],
          [-82.463692, 42.0873351],
          [-82.4636814, 42.0873983],
          [-82.4636593, 42.0874886],
          [-82.4636488, 42.0875608],
          [-82.4636982, 42.0876052],
          [-82.4637593, 42.0876315],
          [-82.4638314, 42.0876125],
          [-82.463891, 42.0875757],
          [-82.4639387, 42.0875481],
          [-82.4639985, 42.0875203],
          [-82.4640592, 42.0875286],
          [-82.4640961, 42.0875551],
          [-82.464219, 42.0876436],
          [-82.4642682, 42.087679],
          [-82.4643421, 42.0877411],
          [-82.4644526, 42.0878117],
          [-82.4645387, 42.0878737],
          [-82.4646126, 42.0879358],
          [-82.464711, 42.0880066],
          [-82.4647729, 42.0880688],
          [-82.4647989, 42.0881496],
          [-82.4648368, 42.0882211],
          [-82.4649108, 42.0882832],
          [-82.4650204, 42.0883179],
          [-82.4651061, 42.0883618],
          [-82.4651675, 42.088406],
          [-82.4652296, 42.0884773],
          [-82.4652555, 42.088549],
          [-82.4652942, 42.0886566],
          [-82.4653205, 42.0887463],
          [-82.4653949, 42.0888264],
          [-82.4654319, 42.088862],
          [-82.4654811, 42.0888974],
          [-82.4655303, 42.0889328],
          [-82.4670402, 42.0889733],
          [-82.4670402, 42.088301],
          [-82.4698149, 42.0883535],
          [-82.46973, 42.0895302],
          [-82.4683759, 42.0895062],
          [-82.4673587, 42.1059143],
          [-82.4646825, 42.1074332],
          [-82.4646113, 42.1095024],
          [-82.4619412, 42.1094426],
          [-82.4617483, 42.1121852],
          [-82.4616581, 42.1135193],
          [-82.4613352, 42.1178913],
          [-82.4609518, 42.1233179],
          [-82.4604737, 42.1298895],
          [-82.4604431, 42.1303174],
          [-82.4598773, 42.1382297],
          [-82.4597227, 42.1403913],
          [-82.4595943, 42.1421761],
          [-82.4587417, 42.1535348],
          [-82.4586203, 42.1550943],
          [-82.4583421, 42.1587903],
          [-82.4579005, 42.1653598],
          [-82.4572862, 42.17397],
          [-82.4570933, 42.1761122],
          [-82.4570935, 42.1777011],
          [-82.4562476, 42.1899061],
          [-82.4559473, 42.1942328],
          [-82.4559387, 42.194386],
          [-82.4559288, 42.1944852],
          [-82.4477951, 42.1941739],
          [-82.437019, 42.1937691],
          [-82.4364838, 42.2014109],
          [-82.4363077, 42.2039252],
          [-82.4357102, 42.212455],
          [-82.4356173, 42.213708],
          [-82.4350319, 42.2215596],
          [-82.4346647, 42.2262113],
          [-82.4344289, 42.2291773],
          [-82.4344201, 42.2293214],
          [-82.4341383, 42.2329364],
          [-82.4340064, 42.2344719],
          [-82.433, 42.2469116],
          [-82.4329903, 42.2470315],
          [-82.4336281, 42.246794],
          [-82.436037, 42.2458733],
          [-82.4369969, 42.2455064],
          [-82.4364173, 42.2516382],
          [-82.440321, 42.2500735],
          [-82.4399938, 42.2532261],
          [-82.4399517, 42.2540907],
          [-82.4398828, 42.2553254],
          [-82.4398204, 42.2562767],
          [-82.4398121, 42.2564031],
          [-82.4396153, 42.2587512],
          [-82.4405698, 42.2587844],
          [-82.4404738, 42.260298],
          [-82.4396882, 42.2602707],
          [-82.4396636, 42.260839],
          [-82.4502695, 42.2585029],
          [-82.4503304, 42.258666],
          [-82.4505139, 42.2588568],
          [-82.4509618, 42.2590258],
          [-82.4510888, 42.2591932],
          [-82.4510719, 42.25943],
          [-82.4508706, 42.2597088],
          [-82.4506396, 42.259831],
          [-82.4499084, 42.2598153],
          [-82.4494674, 42.2598403],
          [-82.449258, 42.2599307],
          [-82.4485802, 42.2606398],
          [-82.4486555, 42.2611793],
          [-82.4486893, 42.2616206],
          [-82.4489738, 42.2618794],
          [-82.4493114, 42.2619509],
          [-82.4494935, 42.2619199],
          [-82.4498763, 42.2616896],
          [-82.4504876, 42.261388],
          [-82.4510506, 42.2613651],
          [-82.4512854, 42.2615673],
          [-82.4514087, 42.2617911],
          [-82.4514627, 42.262246],
          [-82.4513939, 42.2625509],
          [-82.451172, 42.2628559],
          [-82.4506902, 42.2631604],
          [-82.4496682, 42.2632972],
          [-82.4494477, 42.263644],
          [-82.4492847, 42.2638579],
          [-82.4489935, 42.2640219],
          [-82.4487308, 42.2641935],
          [-82.4485476, 42.2643583],
          [-82.4479594, 42.2651942],
          [-82.4479361, 42.2653701],
          [-82.4477509, 42.265664],
          [-82.4473629, 42.2664596],
          [-82.4472379, 42.2668428],
          [-82.4472852, 42.2671157],
          [-82.447449, 42.2675389],
          [-82.4419096, 42.2684923],
          [-82.4391253, 42.2689892],
          [-82.4388476, 42.2726338],
          [-82.4338203, 42.2724188],
          [-82.4336244, 42.2755417],
          [-82.4346888, 42.2755714],
          [-82.434475, 42.2787631],
          [-82.435522, 42.278808],
          [-82.4355161, 42.2802688],
          [-82.4309532, 42.2801258],
          [-82.4309463, 42.2802466],
          [-82.4305203, 42.2878731],
          [-82.4299056, 42.2971569],
          [-82.4299502, 42.2980568],
          [-82.4300169, 42.2985501],
          [-82.4304568, 42.2990024],
          [-82.4307893, 42.2992722],
          [-82.4311112, 42.2995737],
          [-82.4313902, 42.3000261],
          [-82.4313687, 42.3005974],
          [-82.4314867, 42.3015179],
          [-82.4318622, 42.3020337],
          [-82.4320881, 42.3023431],
          [-82.4338369, 42.3026526],
          [-82.4347703, 42.3028986],
          [-82.4354892, 42.3036127],
          [-82.4371575, 42.3052751],
          [-82.4380265, 42.3056004],
          [-82.439078, 42.3055568],
          [-82.4401026, 42.3052394],
          [-82.4408804, 42.305168],
          [-82.4418728, 42.3052473],
          [-82.4428062, 42.3053981],
          [-82.443391, 42.3057194],
          [-82.4437718, 42.30614],
          [-82.4438362, 42.3068104],
          [-82.4422269, 42.30831],
          [-82.4410682, 42.3094407],
          [-82.4397163, 42.3110235],
          [-82.4389117, 42.3121065],
          [-82.4387776, 42.3128285],
          [-82.438504, 42.3135108],
          [-82.4371951, 42.3151808],
          [-82.4370985, 42.3156846],
          [-82.4372058, 42.3162478],
          [-82.4375813, 42.316589],
          [-82.4384878, 42.3169846],
          [-82.4390726, 42.3173268],
          [-82.4393332, 42.3175995],
          [-82.4404016, 42.3172246],
          [-82.441893, 42.3170858],
          [-82.4435452, 42.3169906],
          [-82.4454013, 42.3170382],
          [-82.448518, 42.3172246],
          [-82.4504331, 42.317653],
          [-82.4519995, 42.3180814],
          [-82.4537269, 42.3190016],
          [-82.4591235, 42.3230268],
          [-82.4672643, 42.3298928],
          [-82.4772052, 42.3382128],
          [-82.5516258, 42.3976296],
          [-82.5886144, 42.3976992],
          [-82.8036497, 42.3981039],
          [-82.810717, 42.392412],
          [-82.819261, 42.384166],
          [-82.828722, 42.375037],
          [-82.83025, 42.373492],
          [-82.8548871, 42.3679935],
          [-82.874912, 42.363524],
          [-82.885212, 42.361037],
          [-82.889539, 42.360012],
          [-82.891592, 42.359526],
          [-82.892812, 42.359237],
          [-82.8981067, 42.35809],
          [-82.898813, 42.357937],
          [-82.9019414, 42.3572061],
          [-82.9019414, 42.3572061],
          [-82.906145, 42.356224],
          [-82.911343, 42.35501],
          [-82.913906, 42.354411],
          [-82.923014, 42.352211],
          [-82.9239612, 42.3519961],
          [-82.9388989, 42.3484558],
          [-82.9452283, 42.3469557],
          [-82.9591044, 42.3394466],
          [-82.959631, 42.3392941],
          [-82.9781322, 42.3349324],
          [-82.9884892, 42.3324887],
          [-83.0190277, 42.3295488],
          [-83.0279459, 42.3272159],
          [-83.0402239, 42.324108],
          [-83.0574716, 42.3194913],
          [-83.0634009, 42.3179041],
          [-83.0739929, 42.3118477],
          [-83.0794407, 42.3087588],
          [-83.090734, 42.29628],
          [-83.0966955, 42.2898655],
          [-83.0982818, 42.2867218],
          [-83.1049236, 42.2734357],
          [-83.1113875, 42.2605027],
          [-83.1138683, 42.2571832],
          [-83.1148412, 42.2559189],
          [-83.1148412, 42.2559189],
          [-83.1279303, 42.2387249],
          [-83.128392, 42.2349235],
          [-83.1284231, 42.2345918],
          [-83.1291018, 42.2273438],
          [-83.131039, 42.207371],
          [-83.1313805, 42.2029988],
          [-83.132032, 42.195541],
          [-83.132438, 42.192849],
          [-83.1328652, 42.1869006],
          [-83.1338917, 42.1747093],
          [-83.128086, 42.150761],
          [-83.1238623, 42.1313826],
          [-83.1271827, 42.1084857],
          [-83.127526, 42.104968],
          [-83.128193, 42.101939],
          [-83.1353693, 42.0841754],
          [-83.1415087, 42.0654891],
          [-83.1489449, 42.0432619],
          [-83.1496944, 42.041],
        ],
      ],
    },
  });
  return createdRegion;
};
