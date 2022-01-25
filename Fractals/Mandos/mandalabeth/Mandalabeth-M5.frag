#version 120
#info Mandalabeth Distance Estimator (from marius's boxplorer shader)

#include "MathUtils.frag"
#define providesInit
#include "DE-Raytracer.frag"

#group Mandalabeth


// Number of fractal iterations.
uniform int Iterations;  slider[0,5,100]

// Bailout radius
uniform float Bailout; slider[5,10,64]

// parameter
uniform float par; slider[-2,1,2]
//expo
uniform float expo; slider[2,10,20]
//phase
uniform float phase; slider[-1.54,0,1.54]

void init() {
}
#define p_ sqrt((5.+sqrt(5.))/10.)
#define q_ sqrt((5.-sqrt(5.))/10.)
//mandala
vec2 mandala(vec2 p){
	float r=length(p);
	float a=atan(p.y,p.x);
	r=pow(r,expo+1.0); a*=expo+1.0;a+=phase;
	return r*vec2(cos(a),sin(a));
}
// Compute the distance from `pos` to the Mandalabeth.
float DE(vec3 p) {
	vec3 v=p;
   	float r2 = dot(v,v),dr = 1.;
	mat3 j=mat3(1.0);  
	 
   	for(int i = 0; i<Iterations && r2<Bailout; i++){
      		vec3 p1=par*p;
		mat3 trs=mat3(vec3(0.,q_,p_),vec3(0.,-p_,q_),vec3(1.,0.,0.));
			p1+=vec3(mandala((trs*v).xy),0.)*trs;
		trs=mat3(vec3(1.,0.,0.),vec3(0.,q_,p_),vec3(0.,-p_,q_));
			p1+=vec3(mandala((trs*v).xy),0.)*trs;
		trs=mat3(vec3(0.,-p_,q_),vec3(1.,0.,0.),vec3(0.,q_,p_));
			p1+=vec3(mandala((trs*v).xy),0.)*trs;
		trs=mat3(vec3(0.,q_,p_),vec3(0.,p_,-q_),vec3(-1.,0.,0.));
			p1+=vec3(mandala((trs*v).xy),0.)*trs;
		trs=mat3(vec3(-1.,0.,0.),vec3(0.,q_,p_),vec3(0.,p_,-q_));
			p1+=vec3(mandala((trs*v).xy),0.)*trs;
		trs=mat3(vec3(0.,p_,-q_),vec3(-1.,0.,0.),vec3(0.,q_,p_));
			p1+=vec3(mandala((trs*v).xy),0.)*trs;
		
		dr=2.*(expo+1.0)*pow(r2,0.5*expo)*dr+abs(par);
		v=p1;
		 r2 = dot(v,v);
		orbitTrap = min(orbitTrap, abs(vec4(v,r2)));
   	}
	orbitTrap.w=sqrt(orbitTrap.w);
	float r = sqrt(r2);
	j[0]=abs(j[0]);j[1]=abs(j[1]);j[2]=abs(j[2]);v=j*vec3(1.,1.,1.);
	return abs(log(r)*r)/(dr);//max(v.x,max(v.y,v.z)));
}
#preset default
FOV = 0.4
Eye = 3.88608798,1.78028677,-1.40673322
Target = -4.74966326,-2.17590613,1.7193407
Up = -0.289919369,0.896842429,0.334096417
EquiRectangular = false
AutoFocus = false
FocalPlane = 1
Aperture = 0
Gamma = 2
ToneMapping = 4
Exposure = 1
Brightness = 1
Contrast = 1
AvgLumin = 0.5,0.5,0.5
Saturation = 1
LumCoeff = 0.2125,0.7154,0.0721
Hue = 0
GaussianWeight = 1
AntiAliasScale = 2
DepthToAlpha = false
ShowDepth = false
DepthMagnitude = 1
Detail = -3.3
DetailAO = -0.5
FudgeFactor = 0.49070632
MaxDistance = 1000
MaxRaySteps = 334
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.9881423
Specular = 0.0449827
SpecularExp = 32.472325
SpecularMax = 2
SpotLight = 1,1,1,1
SpotLightDir = 0.58823532,0.58088236
CamLight = 1,1,1,0.16071428
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 1
ShadowSoft = 10.4411766
QualityShadows = false
Reflection = 0
DebugSun = false
BaseColor = 0.756862745,0.756862745,0.756862745
OrbitStrength = 0.54545455
X = 0.5,0.6,0.6,0.61068704
Y = 1,0.6,0,0.41984734
Z = 0.8,0.78,1,0.77099238
R = 0.4,0.7,1,-0.24904214
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = true
Cycles = 9.25384627
EnableFloor = false
FloorNormal = 0,0,1
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 6
Bailout = 16
par = 1
expo = 4
#endpreset