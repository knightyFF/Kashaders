#info A neural network that outputs the SDF for the Stanford bunny.
#info Adapted (actually mostly just copy past) from https://www.shadertoy.com/view/wtVyWK by  blackle @shadertoy 
#info References:
#info - https://vsitzmann.github.io/siren/

//#define KN_VOLUMETRIC
#define USE_EIFFIE_SHADOW
#define MULTI_SAMPLE_AO
//#define providesInit
//#define providesColor
#include "renderer\DE-Kn2.frag" 

// This is an example of 
// a simple distance estimated system.
//
// The function "DE" must return 
// the distance to the closest 
// point on any objects in any direction.
vec3 baseColor(vec3 p, vec3 n) {
	if (mod(length(p*10.0),2.0)<1.0) return vec3(1.0);
   return vec3(0.0);
}

float scene(vec3 p) {
    //sdf is undefined outside the unit sphere, uncomment to witness the abominations
    if (length(p) > 1.) {
        return length(p)-.7;
    }
    //neural networks can be really compact... when they want to be
  vec4 f0_0=sin(p.y*vec4(3.28,.26,-.84,-.55)+p.z*vec4(4.39,-1.08,3.21,.13)+p.x*vec4(3.73,-.21,1.96,3.53)+vec4(.97,7.93,-1.51,7.86));
vec4 f0_1=sin(p.y*vec4(-3.31,.76,-3.74,-4.23)+p.z*vec4(-3.10,3.84,3.77,-3.15)+p.x*vec4(-3.11,-2.11,-1.42,-2.23)+vec4(-2.20,-4.73,6.62,7.22));
vec4 f0_2=sin(p.y*vec4(-2.64,-1.96,-3.24,3.47)+p.z*vec4(3.26,-1.92,3.48,.86)+p.x*vec4(.12,3.82,-2.41,3.89)+vec4(-1.76,-.21,2.05,3.00));
vec4 f0_3=sin(p.y*vec4(2.79,-3.46,-2.95,4.14)+p.z*vec4(1.17,.33,1.43,-2.87)+p.x*vec4(2.39,-2.98,-1.21,-.19)+vec4(-7.07,-4.39,3.12,-7.72));
vec4 f0_4=sin(p.y*vec4(1.15,2.51,-1.82,2.45)+p.z*vec4(2.96,-2.86,2.39,1.12)+p.x*vec4(1.16,-1.37,-1.97,1.83)+vec4(3.95,5.38,5.26,1.22));
vec4 f0_5=sin(p.y*vec4(-.70,4.51,2.71,1.35)+p.z*vec4(-3.29,-.37,-2.82,-4.72)+p.x*vec4(-1.33,-3.47,-4.30,-2.22)+vec4(-7.46,7.11,-7.80,1.68));
vec4 f0_6=sin(p.y*vec4(-3.02,-1.40,-2.96,2.55)+p.z*vec4(3.00,-3.18,-1.60,-1.73)+p.x*vec4(.57,-1.07,2.47,.29)+vec4(4.04,6.00,-3.28,-7.68));
vec4 f0_7=sin(p.y*vec4(2.77,-1.69,-3.67,.71)+p.z*vec4(-.61,-3.96,-1.81,2.02)+p.x*vec4(-1.90,1.37,-.20,-1.96)+vec4(-2.09,-3.33,5.21,2.00));
vec4 f1_0=sin(mat4(.36,.05,-.09,-.15,-.05,.05,.28,-.18,-.18,.18,-.04,.05,.11,-.24,-.28,.06)*f0_0+
    mat4(.60,-.15,-.11,.00,.20,.31,.14,-.13,.32,-.07,.35,.13,-.08,.05,.05,.17)*f0_1+
    mat4(-.09,-.18,.22,-.03,.17,.15,-.07,.38,.11,.07,.16,-.23,-.07,-.09,.12,.21)*f0_2+
    mat4(.41,-.23,.30,.01,.25,-.02,-.06,.33,-.42,-.28,-.02,.02,.15,.08,-.09,-.18)*f0_3+
    mat4(-.13,.40,-.20,-.03,-.10,-.30,.34,-.14,-.16,.12,.40,-.04,-.35,-.30,.02,.30)*f0_4+
    mat4(.07,-.03,.45,.06,.05,-.10,.06,-.11,.08,.29,-.10,.15,-.04,.20,.20,.29)*f0_5+
    mat4(.47,.34,-.32,.15,.02,-.05,.03,.07,.06,.03,-.06,-.16,.42,.02,-.03,-.06)*f0_6+
    mat4(.17,.29,.43,.41,.06,.05,.07,-.44,-.37,-.05,.19,.39,.12,-.31,-.12,.28)*f0_7+
    vec4(1.52,.39,.42,-.91))/1.0+f0_0;
vec4 f1_1=sin(mat4(-.00,-.13,.20,-.25,-.06,-.13,.34,-.04,.12,-.11,-.11,-.10,.09,-.33,.57,.40)*f0_0+
    mat4(.23,.25,-.18,-.08,.09,-.34,-.14,.39,.32,.38,-.34,-.04,-.05,.38,-.28,-.13)*f0_1+
    mat4(-.12,-.16,.11,-.30,-.00,-.06,-.02,-.29,.16,-.26,-.33,-.07,.16,-.10,.11,.45)*f0_2+
    mat4(.15,-.05,-.03,-.26,.37,-.11,.46,.22,.29,.33,.40,-.43,.31,.27,-.46,-.02)*f0_3+
    mat4(-.14,.23,.22,.27,.21,-.12,.37,.27,-.16,-.04,-.21,-.03,-.47,.21,.20,.04)*f0_4+
    mat4(-.02,-.31,.12,-.11,-.15,.36,-.25,.19,.02,-.33,-.17,-.07,-.28,.07,.06,-.16)*f0_5+
    mat4(.15,.03,-.05,-.19,.35,-.13,.31,-.18,.14,-.44,-.07,.67,.37,.42,.05,-.15)*f0_6+
    mat4(.53,-.37,.23,.24,.09,-.42,.20,.08,.40,-.24,.16,.02,.17,.03,-.04,.29)*f0_7+
    vec4(-.48,.41,.90,2.32))/1.0+f0_1;
vec4 f1_2=sin(mat4(-.28,.05,.05,.10,.08,.08,-.25,.17,.11,.17,.33,-.22,.53,-.04,.20,-.19)*f0_0+
    mat4(.35,-.04,.24,-.18,.34,.33,.21,-.02,.00,-.11,.52,.06,.04,.03,.03,-.05)*f0_1+
    mat4(.07,.12,.28,-.44,-.35,-.39,.28,.19,.12,.07,-.00,-.13,.27,.03,-.22,.08)*f0_2+
    mat4(.01,-.14,-.27,.15,.14,-.01,.35,.03,-.20,-.03,.17,-.02,-.05,-.01,-.30,-.10)*f0_3+
    mat4(.13,-.23,-.33,-.10,-.11,-.18,.13,-.03,-.35,-.33,-.29,-.25,.46,.03,.35,-.26)*f0_4+
    mat4(-.04,-.21,.28,-.03,.26,.26,-.05,.00,.10,.19,.09,-.25,-.23,.22,-.02,.63)*f0_5+
    mat4(-.19,-.04,-.28,-.08,-.12,-.14,.07,.03,.15,-.11,-.03,-.08,.25,.03,.04,.13)*f0_6+
    mat4(-.18,.24,.00,-.00,.20,-.33,-.67,.29,-.20,-.32,.27,.05,.18,.37,.29,-.13)*f0_7+
    vec4(.65,.79,-.87,1.02))/1.0+f0_2;
vec4 f1_3=sin(mat4(-.18,.01,.13,.05,-.25,-.23,.18,.02,-.23,.13,.02,.32,-.12,-.17,.22,.10)*f0_0+
    mat4(-.08,-.16,-.04,-.16,.71,-.04,-.04,-.53,-.54,.06,-.28,-.19,.04,.15,.48,-.22)*f0_1+
    mat4(-.41,.24,.15,.46,.20,.02,-.17,-.14,.71,.44,-.05,-.36,.19,-.10,-.34,-.22)*f0_2+
    mat4(.10,.33,.34,.06,-.18,.23,-.33,-.02,.23,.07,-.05,.35,-.19,.05,.01,-.00)*f0_3+
    mat4(-.14,-.15,.19,-.33,.08,.01,.45,.04,.12,-.14,.20,.05,-.04,.20,.22,-.50)*f0_4+
    mat4(-.18,.35,.02,-.12,-.13,.52,-.02,.38,-.01,.26,-.09,-.24,.18,-.19,-.37,.46)*f0_5+
    mat4(-.05,.23,.11,-.32,.46,-.06,-.14,-.24,.28,-.28,.24,.32,-.07,.19,.51,.36)*f0_6+
    mat4(-.04,.14,-.13,.14,.40,-.32,.52,.32,-.23,.25,.11,-.01,-.15,.27,-.32,-.16)*f0_7+
    vec4(1.23,-.91,-1.59,-1.05))/1.0+f0_3;
vec4 f1_4=sin(mat4(.06,.05,-.11,-.14,-.33,.22,-.28,-.11,.04,.30,-.28,.07,-.25,-.16,.32,.05)*f0_0+
    mat4(.13,.15,-.05,.32,.03,-.05,.04,-.19,.42,.09,-.58,-.34,-.19,.11,-.36,-.25)*f0_1+
    mat4(.15,.05,-.01,.23,.20,-.29,.28,.15,-.43,-.58,.06,-.07,.11,-.18,.02,.05)*f0_2+
    mat4(-.05,-.04,-.11,-.00,-.20,.17,-.42,.29,-.18,.04,-.36,.41,.32,.08,-.07,-.37)*f0_3+
    mat4(-.11,-.22,-.27,.18,.05,-.18,-.64,.10,.57,.16,-.22,-.43,.18,.02,-.09,.37)*f0_4+
    mat4(.11,-.20,-.18,.63,-.28,-.19,-.06,.05,.12,.22,.03,.13,-.35,-.25,.46,-.43)*f0_5+
    mat4(.38,.24,-.35,.10,.13,-.14,.05,-.29,.34,-.17,-.07,.06,-.11,.09,.15,-.01)*f0_6+
    mat4(.09,-.10,-.19,-.37,-.16,.39,.01,.50,-.02,.05,.38,-.29,.11,.27,-.23,-.06)*f0_7+
    vec4(1.88,1.49,-.42,1.45))/1.0+f0_4;
vec4 f1_5=sin(mat4(.03,-.09,-.22,-.28,-.14,.19,.02,.28,.45,.32,.03,.21,.12,-.02,.07,-.01)*f0_0+
    mat4(.09,-.08,-.25,.14,.20,-.19,-.23,-.18,-.14,.56,-.17,.32,-.03,-.61,-.11,.13)*f0_1+
    mat4(-.01,.02,-.25,-.46,-.06,.11,-.15,-.36,.19,-.24,.29,-.14,-.04,.54,.12,-.11)*f0_2+
    mat4(-.06,.10,.11,-.24,.13,.33,.10,.01,-.40,-.39,.53,-.74,.18,.40,.29,.38)*f0_3+
    mat4(.44,-.09,-.03,.33,-.34,-.42,.07,.16,-.20,.21,-.06,.28,-.32,-.29,-.17,-.15)*f0_4+
    mat4(.08,.18,.32,.11,.12,.29,-.24,.24,-.25,.05,.27,.07,-.07,-.03,-.35,.12)*f0_5+
    mat4(.26,-.18,.19,-.17,.04,.02,.47,.18,.28,.26,.31,-.09,-.02,.04,.25,.30)*f0_6+
    mat4(.01,.23,-.47,.25,.22,-.20,-.05,-.41,-.23,-.09,-.29,.08,.04,-.01,-.45,.22)*f0_7+
    vec4(.24,1.98,.34,-2.21))/1.0+f0_5;
vec4 f1_6=sin(mat4(.13,-.30,-.26,.24,-.07,-.21,-.02,.23,-.29,-.30,.13,.06,-.03,.50,.37,.21)*f0_0+
    mat4(.32,.14,-.22,.18,-.41,.09,.04,-.12,.17,-.25,-.00,.12,-.16,.15,.08,-.05)*f0_1+
    mat4(.19,-.26,-.20,.12,-.17,.18,.10,-.50,-.04,.06,.28,.14,.15,-.26,-.19,.07)*f0_2+
    mat4(-.06,.49,.06,.31,.08,-.09,.18,.22,.58,-.15,.18,-.10,.18,-.16,-.06,.00)*f0_3+
    mat4(.03,.40,.03,-.06,-.37,.16,-.12,.00,-.15,.02,-.07,-.06,-.06,.06,-.13,-.07)*f0_4+
    mat4(.24,.23,.30,-.22,-.31,-.06,-.13,-.29,-.24,-.12,-.19,-.21,-.28,.03,.18,.14)*f0_5+
    mat4(-.02,-.08,-.29,-.01,-.41,-.43,-.10,-.08,-.27,-.18,-.29,-.19,-.21,-.26,-.05,.07)*f0_6+
    mat4(.01,.31,.15,-.03,.23,-.16,.06,-.09,.05,.22,.47,-.37,-.44,.54,.03,.16)*f0_7+
    vec4(.25,1.13,-1.89,-1.61))/1.0+f0_6;
vec4 f1_7=sin(mat4(-.29,-.02,-.05,-.03,.14,.51,-.06,.08,.11,.04,.18,.02,.04,-.19,.43,-.38)*f0_0+
    mat4(.00,.09,-.19,.11,-.00,-.07,-.00,.47,.09,-.10,.09,-.10,.41,.07,-.16,-.07)*f0_1+
    mat4(-.12,-.09,.07,-.09,-.54,.03,.19,.00,-.00,-.11,.18,.15,.27,-.26,.07,-.02)*f0_2+
    mat4(-.01,.22,-.39,-.29,-.16,-.18,-.24,.07,.08,.27,-.02,.11,.20,.17,-.19,.20)*f0_3+
    mat4(-.11,.06,-.22,.15,-.02,-.35,-.12,-.08,.29,.29,.36,-.07,.04,.21,.39,.19)*f0_4+
    mat4(.20,.23,-.16,-.13,.28,.06,.22,.01,.33,-.31,.16,.49,-.22,.11,-.07,-.05)*f0_5+
    mat4(.17,.02,.20,.21,-.21,.15,-.05,-.20,.42,-.14,-.28,.16,-.16,-.17,-.04,-.24)*f0_6+
    mat4(.05,-.14,.25,.38,.00,.13,-.49,.24,.13,.20,.27,.07,.21,-.17,-.00,.24)*f0_7+
    vec4(-1.61,2.40,-2.27,-.42))/1.0+f0_7;
vec4 f2_0=sin(mat4(.00,.10,-.07,.40,-.08,-.42,.16,-.39,.16,-.30,-.01,-.16,-.23,-.02,.02,-.09)*f1_0+
    mat4(.13,.29,-.26,-.04,.00,.49,.24,-.00,.07,.31,.26,.20,-.22,-.05,-.07,-.36)*f1_1+
    mat4(.38,-.18,.35,.01,.18,-.09,.20,-.19,-.16,.38,-.11,-.07,-.18,-.15,.18,-.03)*f1_2+
    mat4(.53,-.24,.27,-.16,.24,.41,.23,-.37,-.22,.09,-.12,.35,.15,-.30,.03,.00)*f1_3+
    mat4(-.04,.24,-.04,.50,-.19,-.18,.16,.17,.49,-.59,-.40,-.16,.43,.23,-.29,.11)*f1_4+
    mat4(-.22,.14,-.20,.16,.31,.06,.11,-.03,-.28,.03,-.01,-.16,-.07,.30,.49,-.09)*f1_5+
    mat4(.08,.16,-.38,-.15,.31,-.54,.29,-.03,.23,.32,-.01,.31,.03,.24,-.01,-.22)*f1_6+
    mat4(-.01,-.07,-.04,-.09,.16,.14,-.10,-.25,.16,-.25,-.07,-.27,.28,-.08,-.02,-.21)*f1_7+
    vec4(1.42,-1.37,1.02,-1.58))/1.4+f1_0;
vec4 f2_1=sin(mat4(.18,.41,.17,.05,.07,-.10,.36,-.22,.12,-.00,.25,-.19,.33,-.30,.01,.22)*f1_0+
    mat4(.22,-.01,-.03,-.07,.16,-.02,-.14,.46,.26,.18,.38,-.42,.33,.14,.07,.09)*f1_1+
    mat4(.11,-.02,.08,.07,.56,.56,.06,.46,.08,.21,-.06,-.01,-.28,.16,.21,-.47)*f1_2+
    mat4(.29,.06,-.06,.14,-.32,-.31,-.19,.33,-.11,-.52,-.27,.09,.20,-.11,-.03,-.00)*f1_3+
    mat4(.00,.31,-.29,-.47,-.10,-.25,-.31,-.48,.26,.30,-.15,-.09,-.03,-.37,-.08,-.30)*f1_4+
    mat4(-.09,-.21,.29,-.16,.01,-.31,.09,-.07,-.46,.02,.11,.51,-.41,-.05,-.21,-.00)*f1_5+
    mat4(-.10,.24,-.12,.22,.20,-.19,-.09,.07,-.51,.21,-.20,-.29,.17,-.15,.21,.08)*f1_6+
    mat4(.09,.15,.35,.10,-.26,-.09,.13,-.27,.00,-.10,-.07,-.17,.08,.19,.16,-.25)*f1_7+
    vec4(-.24,-.03,.18,-.86))/1.4+f1_1;
vec4 f2_2=sin(mat4(-.16,.37,.23,-.04,-.16,-.03,.42,-.10,.05,.12,.05,-.30,.39,-.04,-.26,.19)*f1_0+
    mat4(-.16,.09,.14,-.07,.01,-.22,-.17,.25,-.31,.16,-.27,.41,.63,.40,-.36,.11)*f1_1+
    mat4(-.25,-.13,-.31,-.33,-.02,.14,.07,.25,.42,-.00,.18,.17,-.08,-.52,-.11,.00)*f1_2+
    mat4(.35,.26,.27,.41,-.18,-.00,.03,.10,-.09,-.24,-.16,.62,.19,-.17,.28,-.23)*f1_3+
    mat4(-.51,-.68,-.16,-.35,-.42,.21,-.16,-.34,-.13,-.28,-.17,-.47,-.14,-.06,.31,-.63)*f1_4+
    mat4(.13,-.01,.18,.18,.06,-.13,-.35,.08,.14,.17,-.17,-.40,.06,.27,-.14,.72)*f1_5+
    mat4(-.46,-.11,.09,-.47,.13,.10,-.33,-.19,.11,-.15,.44,.26,.14,.19,-.34,.11)*f1_6+
    mat4(.18,.35,.35,-.11,-.16,.19,-.12,-.15,-.05,.02,-.44,.32,-.05,-.27,.07,.06)*f1_7+
    vec4(1.85,-.08,1.71,.65))/1.4+f1_2;
vec4 f2_3=sin(mat4(.00,-.04,.06,-.09,-.16,-.08,-.08,-.05,.00,-.30,.01,-.36,-.29,.37,-.40,.26)*f1_0+
    mat4(-.13,-.50,-.08,-.31,.08,-.22,-.28,-.25,-.28,-.03,.44,-.56,.17,-.01,-.23,.45)*f1_1+
    mat4(.13,.16,-.26,.28,-.07,-.07,-.22,.43,-.24,.46,.10,.09,-.30,.05,-.04,-.20)*f1_2+
    mat4(.00,.48,-.08,.25,.01,.21,.01,-.04,-.00,.18,.25,.08,.35,.23,-.37,.23)*f1_3+
    mat4(.29,.19,.25,.36,-.02,-.27,-.28,-.19,-.09,.35,.33,.21,.37,-.19,.50,-.02)*f1_4+
    mat4(-.15,-.15,.14,.19,.04,.12,-.16,-.34,-.05,-.35,-.42,-.32,.04,.33,.10,.09)*f1_5+
    mat4(.03,-.02,.02,.18,-.00,.32,-.17,.08,-.24,.46,.01,-.17,-.18,-.01,-.03,.12)*f1_6+
    mat4(-.01,.21,.28,.31,-.01,.20,.11,-.06,-.05,-.03,-.30,.13,.28,.34,-.04,-.48)*f1_7+
    vec4(1.93,-1.73,1.69,2.07))/1.4+f1_3;
vec4 f2_4=sin(mat4(.27,-.19,-.10,-.13,-.02,-.25,-.05,.32,-.07,.19,.26,.54,-.35,.09,-.09,-.21)*f1_0+
    mat4(-.34,-.31,.42,.31,-.38,.25,.37,-.21,.29,-.39,.16,.07,.45,.21,-.07,-.04)*f1_1+
    mat4(.25,.41,.19,-.28,-.06,.10,-.32,-.14,.02,-.41,-.14,-.21,-.49,.16,.01,-.34)*f1_2+
    mat4(.03,-.24,-.48,-.25,.24,-.00,-.04,-.16,.16,-.08,.27,.18,.03,.41,-.40,-.01)*f1_3+
    mat4(.49,.43,-.50,.17,-.03,.09,-.08,-.09,.00,-.30,.17,.00,.15,-.23,-.30,-.16)*f1_4+
    mat4(-.45,.38,-.28,-.34,-.21,.10,.23,-.01,-.15,.06,.43,.09,-.16,-.18,-.19,.14)*f1_5+
    mat4(.31,.14,.20,.05,.19,.20,.18,.21,-.31,.27,.61,-.11,.09,-.22,.18,.23)*f1_6+
    mat4(.27,.08,.13,-.26,-.14,-.38,.13,.03,.19,-.36,.15,.30,-.17,.28,-.43,-.59)*f1_7+
    vec4(.29,-1.97,-2.12,.65))/1.4+f1_4;
vec4 f2_5=sin(mat4(-.30,.41,.05,-.41,-.05,.16,.17,-.43,-.27,-.12,-.08,-.02,-.02,-.37,.33,.41)*f1_0+
    mat4(-.16,.21,.04,.20,-.49,-.26,-.02,.25,-.19,.21,.30,.11,-.28,.42,.03,-.39)*f1_1+
    mat4(.11,.32,.26,-.09,.09,-.10,.04,.21,.03,-.15,.04,.20,.11,.30,-.14,-.03)*f1_2+
    mat4(-.22,.16,.09,-.50,-.05,-.08,.31,.27,-.13,-.26,-.04,.39,-.15,-.36,-.24,.27)*f1_3+
    mat4(.04,-.15,.39,-.08,.06,.37,-.21,.11,-.18,.08,-.05,.15,-.14,.27,.31,.12)*f1_4+
    mat4(.10,-.07,-.02,.02,-.02,-.08,-.35,.03,.14,.20,.08,-.19,.14,-.07,.52,-.29)*f1_5+
    mat4(-.01,.39,-.63,-.29,.24,.04,-.34,.06,-.25,-.35,.41,.05,-.02,-.15,-.12,.21)*f1_6+
    mat4(-.12,-.05,.04,-.43,-.11,.05,-.06,.40,-.03,.07,-.26,.33,-.07,-.28,.60,-.19)*f1_7+
    vec4(1.20,-1.66,-1.97,-.76))/1.4+f1_5;
vec4 f2_6=sin(mat4(.36,-.01,-.35,-.28,-.21,.16,-.07,.30,-.45,-.43,-.03,.20,.09,-.01,.06,-.05)*f1_0+
    mat4(-.09,.08,-.39,.19,.70,.29,-.15,.00,.12,.32,.22,.16,-.18,-.12,-.16,.28)*f1_1+
    mat4(.26,.22,-.04,-.42,-.20,.18,.09,-.34,-.64,-.47,-.11,-.31,-.47,.11,-.26,.26)*f1_2+
    mat4(.25,.15,.17,-.70,-.44,.09,-.44,.10,-.43,-.10,.14,-.18,.01,.23,-.34,.81)*f1_3+
    mat4(-.06,-.26,.34,-.29,.36,.17,-.45,.33,-.52,-.15,.38,.15,.56,.34,-.15,.11)*f1_4+
    mat4(.12,.18,-.26,-.07,-.33,-.12,.06,-.05,.36,.11,-.12,-.26,-.18,-.15,.30,.45)*f1_5+
    mat4(.26,-.01,.08,-.91,-.30,.44,.22,.30,-.35,-.25,-.33,.40,-.18,-.48,.04,-.13)*f1_6+
    mat4(.03,-.27,-.23,.04,.03,-.09,-.33,.48,-.56,-.27,.24,-.07,-.10,.31,-.05,.35)*f1_7+
    vec4(-2.00,-2.34,-1.98,-2.09))/1.4+f1_6;
vec4 f2_7=sin(mat4(-.10,-.08,-.05,-.12,.24,-.27,.31,-.01,-.23,-.18,.43,.17,.28,-.20,-.15,.35)*f1_0+
    mat4(-.17,.10,.19,-.07,-.41,.48,-.45,.18,-.16,-.01,-.24,.13,.42,.03,.31,-.20)*f1_1+
    mat4(-.13,-.23,.24,-.65,.02,.11,-.31,.37,.26,-.01,.19,.25,-.29,-.06,-.07,.09)*f1_2+
    mat4(.35,.40,-.09,-.12,.18,-.02,.26,.64,-.10,.40,.12,.26,.45,-.40,-.54,-.38)*f1_3+
    mat4(.24,-.08,-.13,.11,.14,-.11,-.23,.30,.27,-.43,.40,-.28,-.37,-.17,.09,.39)*f1_4+
    mat4(-.31,-.02,.16,-.12,-.30,.33,.01,-.30,-.27,.08,-.14,-.25,.24,.53,.14,-.09)*f1_5+
    mat4(.48,.04,.17,.11,-.19,-.02,-.12,.32,.18,.27,-.32,-.06,-.17,.03,-.07,.15)*f1_6+
    mat4(-.10,-.31,-.25,-.52,.08,.02,-.19,-.26,-.08,.12,.04,.35,-.02,-.08,.12,-.05)*f1_7+
    vec4(1.09,-1.26,.75,1.87))/1.4+f1_7;
vec4 f3_0=sin(mat4(.00,-.15,.06,.37,.34,-.22,-.02,.13,-.47,.27,-.53,.10,.23,-.64,.13,.34)*f2_0+
    mat4(.26,-.28,.05,-.24,.26,.07,-.17,-.06,-.39,-.01,.06,.02,-.60,-.07,-.24,.15)*f2_1+
    mat4(-.50,-.22,.10,-.37,.12,-.36,.21,.11,-.03,-.10,-.08,-.06,-.06,.03,.04,.02)*f2_2+
    mat4(-.11,-.21,.35,.03,-.23,.10,-.28,.04,-.42,.52,.32,.02,-.26,-.41,-.25,.32)*f2_3+
    mat4(-.14,-.02,-.17,.01,-.05,-.11,.08,-.31,.21,-.09,.17,.24,-.16,.35,.05,-.07)*f2_4+
    mat4(-.33,.08,.44,-.20,.26,.17,.35,.26,-.14,.16,-.22,-.03,.22,-.27,.21,.50)*f2_5+
    mat4(.08,.00,.02,-.20,.40,.18,-.07,-.41,-.31,.02,-.20,.14,-.31,.03,-.52,.13)*f2_6+
    mat4(.42,.19,-.28,-.15,.00,.20,-.12,.11,-.15,.23,-.30,.21,.38,-.15,.49,.02)*f2_7+
    vec4(1.34,-.07,1.41,-.71))/1.7+f2_0;
vec4 f3_1=sin(mat4(.08,.38,.43,.18,.24,.25,-.36,-.00,.22,-.01,.13,-.05,-.26,.14,-.21,-.16)*f2_0+
    mat4(-.04,.22,-.06,-.23,-.28,-.16,.16,-.03,-.15,.30,.28,.17,-.22,.03,-.50,.41)*f2_1+
    mat4(-.22,.06,-.25,-.01,.24,.20,.57,.08,.28,.49,.46,.26,.24,-.08,-.11,-.58)*f2_2+
    mat4(.01,.41,.09,.51,.04,-.25,-.14,-.04,.35,.15,.16,-.34,-.02,.29,-.01,.76)*f2_3+
    mat4(.13,.13,.25,-.17,-.39,.10,.31,.27,.00,-.01,-.48,.33,.31,-.41,.33,.01)*f2_4+
    mat4(-.06,-.06,-.34,.38,-.20,-.16,-.32,-.27,.03,-.39,-.09,-.18,.01,-.10,-.34,-.32)*f2_5+
    mat4(-.20,-.08,.19,.27,-.09,-.26,.31,-.14,-.10,-.16,.04,-.15,-.06,.29,-.46,-.01)*f2_6+
    mat4(.13,.20,.29,.21,.10,-.22,-.07,.33,.05,.12,.14,.13,-.17,.30,.22,-.33)*f2_7+
    vec4(.04,1.86,2.02,-.29))/1.7+f2_1;
vec4 f3_2=sin(mat4(-.08,-.14,-.27,.40,-.16,-.31,.07,.03,-.22,.07,.17,-.23,-.06,-.03,-.46,-.05)*f2_0+
    mat4(.22,-.01,-.11,-.05,-.26,-.05,-.35,.02,-.45,-.05,.05,.33,-.09,-.07,.12,-.28)*f2_1+
    mat4(.21,-.33,-.00,.83,-.07,.17,-.38,.51,.34,-.44,-.01,.07,-.22,-.24,.24,.06)*f2_2+
    mat4(-.14,.38,-.04,.44,.19,.17,.00,-.40,-.34,.03,.36,.24,-.43,.34,.06,.20)*f2_3+
    mat4(.26,-.14,-.17,-.02,.07,-.28,.26,.48,.25,.17,.21,.38,-.21,.35,.28,-.46)*f2_4+
    mat4(.22,-.08,-.40,-.00,-.26,-.25,-.06,.22,.10,-.39,.03,-.10,-.40,-.08,-.18,-.31)*f2_5+
    mat4(-.07,.13,-.42,-.36,-.33,.21,-.10,-.30,-.57,.07,-.01,-.49,.45,.04,-.35,-.19)*f2_6+
    mat4(-.35,.03,-.40,.08,-.06,-.30,.11,.14,.37,.08,.40,-.01,-.17,-.45,-.46,-.16)*f2_7+
    vec4(-1.75,1.79,2.23,.32))/1.7+f2_2;
vec4 f3_3=sin(mat4(-.03,-.33,-.15,-.01,-.16,.19,-.15,.03,.19,-.24,.00,.12,-.03,-.14,-.26,-.14)*f2_0+
    mat4(.10,-.43,.36,-.02,.05,-.15,-.23,.02,.37,-.01,.43,.15,-.04,-.41,-.05,-.05)*f2_1+
    mat4(.19,.39,-.06,-.11,.10,-.52,-.17,-.16,-.99,.66,.30,-.19,.22,-.22,-.19,-.09)*f2_2+
    mat4(-.08,.29,.19,.09,.07,.23,.39,-.25,.05,.09,-.42,-.14,-.52,-.42,.07,-.04)*f2_3+
    mat4(-.24,-.08,.06,-.03,-.12,-.27,-.28,.06,-.17,-.39,.11,-.16,.09,.24,-.07,.09)*f2_4+
    mat4(.29,.33,.19,.07,.11,-.65,-.20,-.19,-.32,.27,.14,-.06,.14,.33,-.13,.18)*f2_5+
    mat4(.07,.01,.46,.13,.31,.03,-.31,.00,-.30,-.10,.27,-.26,.13,-.31,-.12,-.12)*f2_6+
    mat4(.42,.10,.15,.00,.04,-.18,.42,-.18,.19,.23,.36,.22,.09,.50,-.25,-.29)*f2_7+
    vec4(-1.12,-1.41,-.14,.19))/1.7+f2_3;
vec4 f3_4=sin(mat4(.26,.21,-.05,.20,-.10,-.26,.11,-.07,.66,.33,.30,-.06,-.03,.39,-.49,.27)*f2_0+
    mat4(.16,-.15,.03,-.11,.43,-.42,-.36,-.38,.39,-.02,-.16,-.09,.15,-.28,-.13,-.56)*f2_1+
    mat4(-.22,-.24,.21,-.15,.01,-.02,.44,-.21,-.12,-.57,.18,.06,-.17,.13,.03,.34)*f2_2+
    mat4(-.49,-.27,.12,-.03,-.40,-.37,.14,.01,-.16,-.47,.25,-.13,.33,-.12,-.10,.48)*f2_3+
    mat4(.56,.00,.26,-.12,.14,.50,.13,-.08,-.61,.05,.29,.03,-.20,.13,.15,-.19)*f2_4+
    mat4(-.29,.19,.26,.23,.08,.22,-.19,-.36,.06,.16,.15,-.16,-.18,.12,-.33,-.07)*f2_5+
    mat4(-.15,-.03,.29,-.25,-.04,-.03,.22,.05,.08,-.20,-.56,.42,.52,.27,.13,.06)*f2_6+
    mat4(-.65,-.09,-.32,-.29,-.28,.10,-.15,.29,-.34,.32,.11,-.32,.13,.17,-.20,.14)*f2_7+
    vec4(-1.41,1.71,1.26,-1.39))/1.7+f2_4;
vec4 f3_5=sin(mat4(.24,-.40,-.29,-.01,-.08,-.22,-.05,.38,.26,.38,.29,.18,-.12,-.29,.23,.31)*f2_0+
    mat4(.48,-.27,.52,-.21,.11,-.32,.23,.12,.26,-.48,-.11,.21,-.12,-.22,.22,-.27)*f2_1+
    mat4(.04,.22,-.08,-.03,.32,-.01,.27,.04,.04,-.31,-.03,.31,.01,.05,-.08,-.26)*f2_2+
    mat4(.21,.33,-.45,-.17,.18,-.24,.29,.08,.19,-.48,.10,-.04,-.23,.16,-.16,.39)*f2_3+
    mat4(.29,.09,-.24,-.34,.14,.10,.55,-.22,.47,-.24,.55,.38,-.04,-.20,-.16,.33)*f2_4+
    mat4(.48,.07,-.33,.11,-.35,.03,.25,-.10,.09,-.28,-.37,-.11,-.15,.41,-.01,-.44)*f2_5+
    mat4(.42,-.20,-.31,-.13,-.56,-.13,.19,-.03,.04,-.39,.31,-.02,-.33,.27,.13,-.51)*f2_6+
    mat4(-.12,-.01,.00,-.50,.05,.30,-.17,-.10,-.26,-.02,.10,-.09,-.12,.25,-.14,.30)*f2_7+
    vec4(-1.03,-.52,-1.51,1.11))/1.7+f2_5;
vec4 f3_6=sin(mat4(-.03,-.15,.01,.33,.03,.08,-.09,-.24,.16,-.35,.18,-.54,.15,-.10,.16,-.23)*f2_0+
    mat4(.21,.32,.10,.30,-.13,.08,-.25,-.31,-.05,-.04,.74,.02,.03,-.27,.13,-.36)*f2_1+
    mat4(.19,.23,-.19,.06,-.23,.37,-.32,-.52,-.34,.01,-.28,-.22,-.09,-.18,-.38,-.38)*f2_2+
    mat4(.08,.17,.19,-.18,-.21,.25,.62,.34,-.00,.13,-.24,-.06,-.32,.36,.43,.03)*f2_3+
    mat4(.24,.20,.16,.34,-.28,-.09,-.30,-.22,-.07,.34,.76,.34,.10,.07,.54,.28)*f2_4+
    mat4(-.10,-.21,-.11,.42,-.07,-.21,-.52,.12,-.21,.44,-.23,.33,-.20,-.06,-.23,-.27)*f2_5+
    mat4(-.01,-.26,-.23,-.27,.44,-.12,.30,-.15,-.22,-.09,.08,-.01,.11,.07,.25,-.39)*f2_6+
    mat4(-.10,-.45,-.31,-.41,-.40,.04,-.30,.25,.08,-.04,-.01,-.15,.04,.20,-.23,-.39)*f2_7+
    vec4(.92,1.16,1.63,-1.14))/1.7+f2_6;
vec4 f3_7=sin(mat4(.09,.06,.16,.28,.39,-.60,-.24,.07,.51,-.17,.43,.16,.52,-.16,.05,.22)*f2_0+
    mat4(-.01,.18,.57,.25,.05,-.24,.19,.05,-.27,-.40,.16,.94,-.26,.12,.41,.01)*f2_1+
    mat4(.10,.07,.28,.42,-.06,-.31,.23,.77,-.21,-.45,-.35,.49,-.12,.45,.11,.01)*f2_2+
    mat4(-.33,.01,-.38,.65,.32,.29,.17,-.25,-.14,-.10,-.06,-.01,.12,-.35,-.21,-.38)*f2_3+
    mat4(.31,.23,-.08,-.32,.22,.36,.29,-.10,.51,-.14,.14,.58,.11,-.20,-.25,-.16)*f2_4+
    mat4(-.15,-.25,.44,-.43,-.69,-.12,-.09,.37,-.34,.41,.34,-.77,-.36,-.02,-.23,.31)*f2_5+
    mat4(-1.00,-.29,-.19,.40,-.13,.13,-.10,-.23,-.04,.16,-.33,.41,-.48,.16,.21,.25)*f2_6+
    mat4(-.23,-.30,-.02,-.23,-.46,-.33,.05,-.20,.18,-.13,-.04,-.44,.01,-.29,-.34,.29)*f2_7+
    vec4(1.58,-.55,-.57,1.99))/1.7+f2_7;
vec4 f4_0=sin(mat4(.02,-.11,-.12,-.19,-.05,.02,-.11,.34,-.11,.16,.08,-.37,.41,.33,-.45,.15)*f3_0+
    mat4(-.27,.55,-.32,-.08,-.40,.31,.11,-.30,.19,-.83,-.27,.16,-.10,.34,-.02,.01)*f3_1+
    mat4(.23,-.09,-.36,.34,.36,.17,-.29,-.02,-.17,.19,-.02,-.03,.12,-.29,-.32,-.63)*f3_2+
    mat4(-.63,-.32,-.06,-.00,-.57,-.04,-.50,.17,.30,.29,.05,.24,.22,-.03,-.05,.05)*f3_3+
    mat4(.12,.18,.40,.24,-.14,.01,-.16,.11,.40,.36,.08,.36,-.26,-.44,-.17,-.36)*f3_4+
    mat4(.37,-.43,-.19,-.05,-.37,.28,-.28,.09,.28,.15,.52,-.21,.17,.11,.09,.00)*f3_5+
    mat4(.29,.02,.51,-.06,-.08,-.37,-.18,.21,-.23,-.26,-.46,-.04,-.15,-.09,-.01,.00)*f3_6+
    mat4(.04,.08,.35,.01,.10,.21,-.18,.20,-.34,.31,-.14,-.04,.60,-.02,.42,.04)*f3_7+
    vec4(.63,-1.50,-.51,1.93))/2.0+f3_0;
vec4 f4_1=sin(mat4(.25,.16,-.16,-.43,.16,-.11,-.03,.64,-.01,.09,.43,-.17,-.11,-.40,-.23,.47)*f3_0+
    mat4(-.23,-.13,-.20,.16,.28,-.22,-.25,-.35,-.08,-.34,-.21,-.35,.12,-.30,.28,.02)*f3_1+
    mat4(-.35,-.30,.12,.17,.20,-.14,-.66,.12,.06,-.39,.27,-.20,.19,-.40,-.54,.04)*f3_2+
    mat4(-.17,-.04,.03,-.24,-.49,-.30,-.22,.18,.22,-.01,.06,.68,.06,-.00,-.23,-.25)*f3_3+
    mat4(.18,-.53,-.51,-.42,.49,.30,-.37,.02,-.52,.09,.09,-.29,.20,.06,.37,-.09)*f3_4+
    mat4(-.08,-.18,-.19,-.37,.49,-.34,-.13,.15,-.16,.11,.28,.15,-.35,.05,-.13,.42)*f3_5+
    mat4(-.07,-.21,.11,.22,.15,.51,-.39,-.10,-.10,-.04,.18,-.25,-.11,-.37,.11,.32)*f3_6+
    mat4(-.25,-.23,.18,.26,.19,.38,.08,.42,-.70,.23,-.26,.14,.01,.27,.84,.15)*f3_7+
    vec4(.99,-1.91,-1.60,-.78))/2.0+f3_1;
vec4 f4_2=sin(mat4(.37,.12,.42,-.27,.17,.15,-.36,.16,.02,-.13,.41,.39,.03,-.07,-.11,-.27)*f3_0+
    mat4(-.10,.00,.36,-.06,-.29,-.38,.36,-.06,.22,.17,.18,-.37,-.05,-.35,-.18,-.08)*f3_1+
    mat4(-.28,-.07,.02,-.02,-.22,-.19,-.21,.00,.16,-.03,.36,.03,-.51,-.13,-.31,-.03)*f3_2+
    mat4(-.53,-.06,-.00,.06,.14,-.26,-.26,-.35,-.21,.11,-.11,.14,-.05,-.20,.25,-.03)*f3_3+
    mat4(-.34,.12,.51,-.02,.08,-.24,.00,.03,-.00,-.26,-.29,-.14,.42,-.02,.07,-.04)*f3_4+
    mat4(.49,.13,-.15,.26,-.16,-.06,-.25,-.01,-.26,.61,-.49,.13,-.69,.29,.11,.22)*f3_5+
    mat4(-.33,-.15,-.13,-.39,.05,-.15,-.05,.22,.28,.21,.17,.11,.06,.41,-.17,.09)*f3_6+
    mat4(-.02,.06,-.19,.19,.39,-.26,-.18,.01,.43,.09,-.70,.08,.10,-.15,.15,-.24)*f3_7+
    vec4(.04,.84,-.32,.19))/2.0+f3_2;
vec4 f4_3=sin(mat4(.12,-.26,-.06,.33,.23,.32,-.17,.03,.52,.18,.19,.12,-.15,-.04,-.42,.25)*f3_0+
    mat4(.15,.16,.06,-.15,.09,-.05,-.10,.37,-.13,.35,.29,.16,.22,-.08,.22,.29)*f3_1+
    mat4(-.29,-.34,-.07,.60,.15,.18,.19,.04,.15,-.31,.28,-.15,.02,.20,-.05,-.11)*f3_2+
    mat4(.10,.04,-.08,-.40,-.34,-.45,-.25,-.26,-.11,.10,-.64,.21,.09,.37,-.56,-.36)*f3_3+
    mat4(.07,-.39,-.09,.42,-.31,-.15,-.21,.43,.18,.05,-.13,.11,.06,-.11,-.17,-.16)*f3_4+
    mat4(.38,-.02,-.13,-.16,.32,-.35,.01,.25,.08,.07,.06,.04,-.08,.03,.00,.45)*f3_5+
    mat4(.18,.13,-.57,.25,-.20,-.15,-.09,-.64,.08,.04,-.01,-.14,.12,.00,-.05,.39)*f3_6+
    mat4(.29,-.00,.29,-.03,-.01,-.34,-.17,.30,-.07,-.02,.15,.52,.02,-.35,-.53,-.56)*f3_7+
    vec4(-.34,1.21,.99,-.23))/2.0+f3_3;
vec4 f4_4=sin(mat4(-.17,.13,.11,.17,-.20,.35,-.35,-.10,-.09,.57,-.04,.18,-.14,-.13,.38,-.16)*f3_0+
    mat4(.12,.36,-.06,.40,-.17,.27,-.35,-.09,-.15,-.26,-.47,.18,.19,.06,.01,-.23)*f3_1+
    mat4(-.16,-.26,.21,.10,-.10,.66,-.25,.17,-.11,.14,-.33,-.14,.02,.23,.69,-.57)*f3_2+
    mat4(-.05,.49,.19,-.56,-.02,.16,.65,-.01,.22,.04,.24,.32,-.01,.52,.12,.21)*f3_3+
    mat4(.14,.11,-.09,-.16,-.14,-.19,.39,-.04,.05,.34,.02,.24,.24,-.18,.08,-.23)*f3_4+
    mat4(-.09,.10,.06,-.12,-.02,-.15,-.05,.09,.14,-.31,-.06,.45,-.03,.11,.29,-.04)*f3_5+
    mat4(.14,-.21,-.05,-.23,.01,.12,-.01,.16,.12,-.00,.33,-.41,.10,.26,.24,.21)*f3_6+
    mat4(.12,.04,-.03,-.12,-.12,-.11,.57,-.00,.15,-.47,.23,.20,.12,-.25,-.19,.04)*f3_7+
    vec4(-1.56,-1.34,1.85,.18))/2.0+f3_4;
vec4 f4_5=sin(mat4(.28,-.13,-.03,.06,.03,-.25,-.45,.27,-.15,-.10,-.13,.26,-.10,-.62,-.23,-.67)*f3_0+
    mat4(-.23,-.11,.18,.03,.17,.09,-.05,-.20,.23,.22,.13,.05,-.02,-.04,-.17,-.21)*f3_1+
    mat4(.23,.16,.12,-.02,.20,.18,.21,-.05,-.21,.06,.12,.20,.10,-.17,.04,.01)*f3_2+
    mat4(-.01,.02,.17,-.13,-.08,-.25,.02,-.05,.12,.16,-.57,-.40,.28,-.60,.02,.04)*f3_3+
    mat4(.42,.41,.05,.09,-.16,.16,.03,.01,-.41,.01,.08,.24,.18,.23,.15,.22)*f3_4+
    mat4(-.23,.00,.46,.34,.27,-.07,.27,.34,-.06,.30,-.20,.22,-.18,.17,-.09,-.20)*f3_5+
    mat4(.08,.30,-.02,-.12,.02,.12,-.06,.23,.19,.20,.07,.09,-.26,-.20,-.19,-.13)*f3_6+
    mat4(-.12,.63,-.01,.08,-.11,-.07,.04,.15,-.29,-.37,-.01,.14,.09,.14,-.03,.44)*f3_7+
    vec4(.58,-.46,-.18,-.43))/2.0+f3_5;
vec4 f4_6=sin(mat4(.34,.07,.16,.15,-.39,-.22,-.13,.05,.26,.15,-.08,-.05,.35,.27,.09,.36)*f3_0+
    mat4(-.11,-.35,-.18,.02,-.24,-.24,-.07,.11,.23,.06,-.32,.07,.06,.48,.05,.13)*f3_1+
    mat4(-.29,.05,.45,-.03,-.07,-.27,.12,-.03,.24,.30,.01,.16,-.12,-.48,.36,.16)*f3_2+
    mat4(.08,.08,-.20,-.13,.12,.15,-.35,.29,.30,-.23,.26,.31,-.14,-.16,-.01,-.05)*f3_3+
    mat4(-.36,-.23,.32,-.16,-.15,-.03,-.16,.01,.08,.21,.04,-.07,.04,.26,.03,-.30)*f3_4+
    mat4(-.25,.08,-.06,-.43,-.49,-.10,.04,.06,-.21,.01,.06,.04,.18,.22,.06,-.06)*f3_5+
    mat4(.08,-.02,-.20,-.56,-.16,-.16,.01,-.05,-.26,.14,-.28,-.16,.11,-.19,.14,.23)*f3_6+
    mat4(-.13,.07,-.14,-.04,.16,.50,.26,-.04,.05,.13,.01,-.06,-.16,.35,.05,.14)*f3_7+
    vec4(.64,.80,.24,-.11))/2.0+f3_6;
vec4 f4_7=sin(mat4(.03,.17,-.26,.26,-.04,.19,-.00,.10,-.31,.27,-.11,.16,-.33,-.03,.50,-.29)*f3_0+
    mat4(.25,.01,-.04,.28,-.05,-.25,-.03,.05,.13,-.05,.10,.18,.00,-.02,-.28,-.12)*f3_1+
    mat4(.00,-.48,.24,-.23,.12,.28,.08,-.31,.08,-.29,.31,-.14,.40,-.12,.15,-.02)*f3_2+
    mat4(.17,-.32,-.03,.09,-.35,-.07,.09,-.03,-.19,-.53,.43,-.32,-.30,.47,-.29,.27)*f3_3+
    mat4(-.43,.13,-.57,-.14,.06,-.15,.40,-.16,.19,.06,-.23,-.24,-.32,.41,.03,.12)*f3_4+
    mat4(.14,.23,.26,.16,.14,-.00,.34,-.28,.11,.14,-.18,.13,.09,-.24,.33,.08)*f3_5+
    mat4(.02,.26,.01,.40,.13,.20,-.17,-.25,-.29,-.08,.34,-.09,-.06,.26,-.29,-.25)*f3_6+
    mat4(.12,.35,.47,.25,-.02,-.14,.49,.08,.15,-.17,.41,-.00,-.25,.05,-.06,-.06)*f3_7+
    vec4(-.77,-1.89,-.58,1.46))/2.0+f3_7;
return dot(f4_0,vec4(-.01,.03,.04,-.02))+
    dot(f4_1,vec4(.03,.03,.03,.01))+
    dot(f4_2,vec4(-.03,.01,-.02,.02))+
    dot(f4_3,vec4(.03,.01,-.02,.03))+
    dot(f4_4,vec4(.00,.03,-.03,.02))+
    dot(f4_5,vec4(.02,.03,.02,.02))+
    dot(f4_6,vec4(-.01,-.03,.00,-.01))+
    dot(f4_7,vec4(.01,-.03,.02,.01))+
    0.166;
}

float  DE(vec3 z) {
	return scene(z);
}

#preset Default
FOV = 0.42276
Eye = 2.78475,-0.167682,0.539346
Target = -11.0777,0.774937,-1.97396
Up = -0.0182106,0.0816224,0.996497
FocalPlane = 13.7752
Aperture = 0
InFocusAWidth = 0.30189
ApertureNbrSides = 2
ApertureRot = 0
ApStarShaped = false
Gamma = 2.2
ToneMapping = 2
Exposure = 1
Brightness = 1
Contrast = 1.3125
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 1.5
Bloom = false
BloomIntensity = 0.1
BloomPow = 0.9722
BloomTaps = 15
Detail = -3
RefineSteps = 2
FudgeFactor = 0.43717
MaxRaySteps = 1027
MaxDistance = 57.85
Dither = 0.86598
NormalBackStep = 2
DetailAO = -2.18638
coneApertureAO = 1
maxIterAO = 1
AO_ambient = 0.64752
AO_camlight = 0
AO_pointlight = 0
AoCorrect = 0
Specular = 1
SpecularExp = 129.945
CamLight = 1,1,1,0
AmbiantLight = 0.490196,0.662745,0.882353,0.48048
Glow = 1,1,1,0
GlowMax = 11
Reflection = 0.101961,0.101961,0.0823529
ReflectionsNumber = 0 Locked
SpotGlow = false
SpotLight = 1,0.988235,0.929412,3
LightPos = -1.9898,1.1828,4.796
LightSize = 0.4325
LightFallOff = 0
LightGlowRad = 0.5769
LightGlowExp = 1.519
HardShadow = 0 Locked
ShadowSoft = 0
BaseColor = 0.792157,0.792157,0.792157
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.384314,0.501961,0.6
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,1
FloorHeight = -0.5465
FloorColor = 0.34902,0.317647,0.196078
HF_Fallof = 1.76802
HF_Const = 0
HF_Intensity = 0
HF_Dir = 0,0,1
HF_Offset = -3.012
HF_Color = 0.478431,0.584314,0.737255,1.41849
HF_Scatter = 10
HF_Anisotropy = 0.352941,0.356863,0.407843,0
HF_FogIter = 8
HF_CastShadow = true
CloudScale = 1
CloudFlatness = 0
CloudTops = 1
CloudBase = -1
CloudDensity = 1
CloudRoughness = 1
CloudContrast = 1
CloudColor = 0.65,0.68,0.7
SunLightColor = 0.7,0.5,0.3
#endpreset
