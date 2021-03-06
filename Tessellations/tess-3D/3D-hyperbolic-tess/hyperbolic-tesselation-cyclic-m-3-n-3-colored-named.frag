#version 130
#info 3D hyperbolic tessellation. Coxeter group cyclic m-3-n-3. Poincar? ball model. Distance Estimator (knighty 2012)

#include "MathUtils.frag"
#define providesInit
#define providesColor
#include "DE-Raytracer.frag"

#group Hyperbolic-tesselation
// Iteration number.
uniform int Iterations;  slider[0,10,20]

// Symmetry group type.
uniform int TypeM;  slider[4,5,5]

// Symmetry group type.
uniform int TypeN;  slider[3,5,6]

// U 'barycentric' coordinate for the 'principal' node
uniform float U; slider[0,1,1]

// V
uniform float V; slider[0,0,1]

// W
uniform float W; slider[0,0,1]

// T
uniform float T; slider[0,0,1]

//vertex radius 
uniform float VRadius; slider[0,0.05,0.5]

//segments radius 
uniform float SRadius; slider[0,0.01,0.1]

//If you want to have thickness of vetices and segments not affected by the stereographic projection
uniform bool useUniformRadius; checkbox[false]

//If you want to dive inside the hyperbolic space. You will need to set the position of the camera at 0,0,0
uniform bool useCameraAsRotVector; checkbox[false]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[-1,0,1]

//cutting sphere radius
uniform float CSphRad; slider[0,0.75,1]

#group HTess-Color
uniform vec3 segAColor; color[0.0,0.0,0.0]
uniform vec3 segBColor; color[0.0,0.0,0.0]
uniform vec3 segCColor; color[0.0,0.0,0.0]
uniform vec3 segDColor; color[0.0,0.0,0.0]
uniform vec3 verticesColor; color[0.0,0.0,0.0]

//#define PI 3.14159
vec4 nc,nd,p;
float cVR,sVR,cSR,sSR,cRA,sRA;
float pp;
float hdot(vec4 a, vec4 b){//dot product for Minkowski space.
	return dot(a.xyz,b.xyz)-a.w*b.w;
}
vec4 hnormalizew(vec4 v){//normalization of (timelike) vectors in Minkowski space.
	float l=1./sqrt(v.w*v.w-dot(v.xyz,v.xyz));
	return v*l;
}
void init() {
	float cospim=cos(PI/float(TypeM)), cospin=cos(PI/float(TypeN));
	float scospim=sqrt(3./4.-cospim*cospim), scospin=sqrt(cospin*cospin+(cospim+cospin)*(cospim+cospin)/(3.-4.*cospim*cospim)-3./4.);
	//il y a un probl?me quand M ou N =6. j'aurai une division par 0 car cos?(PI/6)=3/4!
	//je dois revoir la copie concernant la determination des plans formant le domaine fondamental :-/	

	//na and nb are simply vec4(1.,0.,0.,0.) and vec4(0.,1.,0.,0.) respectively
	nc=vec4(-cospim,-0.5,scospim,0.);
	nd=vec4(-0.5,-cospin,-0.5*(cospin+cospim)/scospim,-scospin);

	vec4 pabc,pbdc,pcda,pdba;
	pabc=vec4(0.,0.,0.,nc.z);
	pbdc=vec4(-nc.z*nd.w,0.,nc.x*nd.w,(-nc.z*nd.x+nc.x*nd.z));
	pcda=vec4(0.,-nc.z*nd.w,nc.y*nd.w,(nc.y*nd.z-nc.z*nd.y));
	pdba=vec4(0.,0.,-nd.w,-nd.z);
	
	p=U*pabc+V*pbdc+W*pcda+T*pdba;
	pp=-hdot(p,p);
	if(pp>1e-4) {p=hnormalizew(p); pp=1.;}//hnormalizew(U*pabc+V*pbdc+W*pcda+T*pdba);

	cVR=cosh(VRadius);sVR=sinh(VRadius);
	cSR=cosh(SRadius);sSR=sinh(SRadius);
	cRA=cosh(RotAngle);sRA=-sinh(RotAngle);
}
uniform vec3 Eye; //slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; //slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
vec4 Rotate(vec4 p){
	//this is a (hyperbolic) rotation (that is, a boost) on the plane defined by RotVector and w axis
	//We do not need more because the remaining 3 rotation are in our 3D space
	//That would be redundant.
	//This rotation is equivalent to a translation inside the hyperbolic space when the camera is at 0,0,0
	vec4 p1=p;
	vec3 rv;
	if (useCameraAsRotVector) rv=normalize(Eye-Target); else rv=normalize(RotVector);
	float vp=dot(rv,p.xyz);
	p1.xyz+=rv*(vp*(cRA-1.)+p.w*sRA);
	p1.w+=vp*sRA+p.w*(cRA-1.);
	return p1;
}

vec4 fold(vec4 pos) {//beside using minkowski dot product, its exactly the same as for euclidean space
	for(int i=0;i<Iterations;i++){
		pos.xy=abs(pos.xy);
		float t=-2.*min(0.,hdot(pos,nc)); pos+=t*nc;
		t=-2.*min(0.,hdot(pos,nd)); pos+=t*nd;
	}
	return pos;
}

float DD(float ca, float sa, float r){//converts hyperbolic distance to distance in projection flat space. ca and sa are the hyperbolic cosine and sine of the hyperbolic distance which is an "angle".
	return (2.*r*ca+(1.+r*r)*sa)/((1.+r*r)*ca+2.*r*sa+1.-r*r)-r;
}

float dist2Vertex(vec4 z, float r){
	float ca=-hdot(z,p), sa=0.5*sqrt(-hdot(p-z,p-z)*hdot(p+z,p+z));
	
	if(useUniformRadius) return DD(ca,sa,r)-VRadius;
	else return DD(ca*cVR-sa*sVR,sa*cVR-ca*sVR,r);
}

float dist2Segment(vec4 z, vec4 n, float r){
	//pmin is the orthogonal projection of z onto the plane defined by p and n
	//then pmin is projected onto the unit sphere
	float zn=hdot(z,n),zp=hdot(z,p),np=hdot(n,p);
	float det=1./(pp+np*np);
	float alpha=det*(zn*np-zp), beta=det*(np*zp+zn*pp);
	vec4 pmin=hnormalizew(alpha*p+min(0.,beta)*n);
	//ca and sa are the hyperbolic cosine and sine of the "angle" between z and pmin. This is the distance in hyperbolic space.
	float ca=-hdot(z,pmin), sa=0.5*sqrt(-hdot(pmin-z,pmin-z)*hdot(pmin+z,pmin+z));
	if(useUniformRadius) return DD(ca,sa,r)-SRadius;
	else return DD(ca*cSR-sa*sSR,sa*cSR-ca*sSR,r);//we subtract the width of the sgment before conversion
}
//it is possible to compute the distance to a face just as for segments: pmin will be the orthogonal projection
// of z onto the 3-plane defined by p and two n's (na and nb, na and nc, na and and, nb and nd... and so on).
//that involves solving a system of 3 linear equations.
//it's not implemented here because it is better with transparency

float dist2Segments(vec4 z, float r){
	float da=dist2Segment(z, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z, vec4(0.,1.,0.,0.), r);
	float dc=dist2Segment(z, nc, r);
	float dd=dist2Segment(z, nd, r);
	
	return min(min(da,db),min(dc,dd));
}

float DE(vec3 pos) {
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.+r*r)*1./(1.-r*r);//Inverse stereographic projection of pos: z4 lies onto the unit 3-parabolid of revolution around w axis centered at 0.
	z4=Rotate(z4);
	z4=fold(z4);
	orbitTrap=z4;
	if(pp==1.) 
		return max(r-CSphRad,min(dist2Vertex(z4,r),dist2Segments(z4, r)));
	else
		return max(r-CSphRad,dist2Segments(z4, r));
}

vec3 baseColor(vec3 pos, vec3 normal){
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.+r*r)*1./(1.-r*r);
	z4=Rotate(z4);
	z4=fold(z4);
	float da=dist2Segment(z4, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z4, vec4(0.,1.,0.,0.), r);
	float dc=dist2Segment(z4, nc, r);
	float dd=dist2Segment(z4, nd, r);
	float dv=dist2Vertex(z4,r);
	float d=min(min(da,db),min(dc,dd));
	if (pp==1.) d=min(d, dv);
	vec3 color=segAColor;
	if(d==db) color=segBColor;
	if(d==dc) color=segCColor;
	if(d==dd) color=segDColor;
	if(d==dv) color=verticesColor;
	return color;
}
#preset Default
FOV = 0.4
Eye = 0,0,0
Target = -0.818906,0.0437113,0.57226
Up = 0.0370439,0.999042,-0.0232953
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 1
VRadius = 0.13334
SRadius = 0.04286
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset
//[(4,3,3,3)] family
#preset N?38
FOV = 0.4
Eye = 0,0,0
Target = -0.426901,0.328683,0.84245
Up = 0.155974,0.950598,-0.268395
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.66234
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?39
FOV = 0.4
Eye = 0,0,0
Target = -0.0592282,0.281451,0.957746
Up = 0.16358,0.954398,-0.24973
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5065
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?40
FOV = 0.4
Eye = 0,0,0
Target = -0.241945,0.122533,0.962521
Up = 0.149224,0.986493,-0.0675555
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5065
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?41
FOV = 0.4
Eye = 0,0,0
Target = -0.241945,0.122533,0.962521
Up = 0.149224,0.986493,-0.0675555
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 1
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?42
FOV = 0.4
Eye = 0,0,0
Target = -0.403167,0.00558916,0.915109
Up = 0.125879,0.989748,0.0674722
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 1
T = 0
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?43
FOV = 0.4
Eye = 0,0,0
Target = -0.16958,-0.39158,0.904381
Up = -0.0224973,0.91224,0.409038
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?44
FOV = 0.4
Eye = 0,0,0
Target = -0.16958,-0.39158,0.904381
Up = -0.0224973,0.91224,0.409038
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?45
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0640797,0.781639,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 0
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset

#preset N?46
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0640797,0.781639,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 3
#endpreset
//[(5,3,3,3)] family
#preset N?47
FOV = 0.4
Eye = 0,0,0
Target = -0.426901,0.328683,0.84245
Up = 0.155974,0.950598,-0.268395
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.66234
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?48
FOV = 0.4
Eye = 0,0,0
Target = -0.0592282,0.281451,0.957746
Up = 0.16358,0.954398,-0.24973
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5065
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?49
FOV = 0.4
Eye = 0,0,0
Target = -0.241945,0.122533,0.962521
Up = 0.149224,0.986493,-0.0675555
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5065
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?50
FOV = 0.4
Eye = 0,0,0
Target = -0.241945,0.122533,0.962521
Up = 0.149224,0.986493,-0.0675555
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 1
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?51
FOV = 0.4
Eye = 0,0,0
Target = -0.403167,0.00558916,0.915109
Up = 0.125879,0.989748,0.0674722
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 1
T = 0
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?52
FOV = 0.4
Eye = 0,0,0
Target = -0.16958,-0.39158,0.904381
Up = -0.0224973,0.91224,0.409038
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?53
FOV = 0.4
Eye = 0,0,0
Target = -0.16958,-0.39158,0.904381
Up = -0.0224973,0.91224,0.409038
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?54
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0640797,0.781639,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 0
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset

#preset N?55
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0640797,0.781639,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 3
#endpreset
//[(4,3,4,3)] family
#preset N?56
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 0
VRadius = 0.32184
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 4
#endpreset

#preset N?57
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 0
VRadius = 0.32184
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 4
#endpreset

#preset N?58
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 1
VRadius = 0.32184
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 4
#endpreset

#preset N?59
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 1
VRadius = 0.1954
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 4
#endpreset

#preset N?60
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 1
VRadius = 0.1954
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 4
#endpreset

#preset N?61
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 1
VRadius = 0.14368
SRadius = 0.06897
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 4
#endpreset
//[(4,3,5,3)] family
#preset N?62
FOV = 0.4
Eye = 0,0,0
Target = -0.426901,0.328683,0.84245
Up = 0.155974,0.950598,-0.268395
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.66234
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?63
FOV = 0.4
Eye = 0,0,0
Target = -0.0592282,0.281451,0.957746
Up = 0.16358,0.954398,-0.24973
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5065
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?64
FOV = 0.4
Eye = 0,0,0
Target = -0.241945,0.122533,0.962521
Up = 0.149224,0.986493,-0.0675555
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 0
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5065
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?65
FOV = 0.4
Eye = 0,0,0
Target = -0.241945,0.122533,0.962521
Up = 0.149224,0.986493,-0.0675555
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 1
VRadius = 0.16667
SRadius = 0.06092
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?66
FOV = 0.4
Eye = 0,0,0
Target = -0.403167,0.00558916,0.915109
Up = 0.125879,0.989748,0.0674722
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 1
T = 0
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?67
FOV = 0.4
Eye = 0,0,0
Target = -0.16958,-0.39158,0.904381
Up = -0.0224973,0.91224,0.409038
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?68
FOV = 0.4
Eye = 0,0,0
Target = -0.16958,-0.39158,0.904381
Up = -0.0224973,0.91224,0.409038
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?69
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0640797,0.781639,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 0
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset

#preset N?70
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0640797,0.781639,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 1
VRadius = 0.11495
SRadius = 0.04943
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 4
TypeN = 5
#endpreset
//[(5,3,5,3)] family
#preset N?71
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 0
VRadius = 0.32184
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 5
#endpreset

#preset N?72
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 0
VRadius = 0.32184
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 5
#endpreset

#preset N?73
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 0
V = 1
W = 0
T = 1
VRadius = 0.32184
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 5
#endpreset

#preset N?74
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 0
W = 0
T = 1
VRadius = 0.1954
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 5
#endpreset

#preset N?75
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 0
T = 1
VRadius = 0.1954
SRadius = 0.07931
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 5
#endpreset

#preset N?76
FOV = 0.4
Eye = 0,0,0
Target = -0.00959145,-0.609113,0.793025
Up = -0.0639161,0.781652,0.620431
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.928
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.42857
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
U = 1
V = 1
W = 1
T = 1
VRadius = 0.14368
SRadius = 0.06897
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.11688
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
TypeM = 5
TypeN = 5
#endpreset