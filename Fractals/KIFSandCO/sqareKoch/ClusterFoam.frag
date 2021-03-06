#info Cluster-foam Distance Estimator.
#define providesInit
#include "fast-Raytracer.frag"
#include "MathUtils.frag"
#group Menger

// Number of fractal iterations.
uniform int Iterations;  slider[0,8,100]
void init() {}

float DE(vec3 z)
{
	int n = 0;
	while (n < Iterations) {
		z = abs(z);
		if (z.x < z.y)
			z.xy = z.yx;
		if (z.z < z.y)
			z.zy = z.yz;
		if (z.x < z.z)
			z.xz = z.zx;
             z = z * 3.0;
            	vec3 to1 = z - vec3(2.0, 2.0, 2.0);
		vec3 to2 = z - vec3(2.0, 0.0, 2.0);
		vec3 to3 = z - vec3(4.0, 0.0, 0.0);
		float corner = dot(to1, to1);
		float edge = dot(to2, to2);
             float front = dot(to3, to3);;
            	if (corner < edge && corner < front)
  			z -= vec3(2.0, 2.0, 2.0);
		else if (edge < corner && edge < front)
			z -= vec3(2.0, 0.0, 2.0);		
             else
			z -= vec3(4.0, 0.0, 0.0);		
		n++;
		if(dot(z,z)>100.0) break;
	}
	
	return abs(length(z)-2.0 ) * pow(3.0, float(-n));
}

#preset Default
FOV = 0.4
Eye = -3.72729,-0.0860174,-1.93389
Target = 5.14721,0.118786,2.6706
Up = -0.00348884,0.999311,-0.0369503
AntiAlias = 1
Detail = -2.35396
DetailAO = -1.00002
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 3.774
Dither = 0.5
AO = 0,0,0,0.7
Specular = 0.1666
SpecularExp = 16
SpotLight = 1,1,1,0.19608
SpotLightDir = 0.37142,0.1
CamLight = 1,1,1,1.13978
CamLightMin = 0.29412
Glow = 1,1,1,0.07895
Fog = 0.4161
HardShadow = 0.33846
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 6.95699
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 3
RotVector = 1,1,1
RotAngle = 0
Offset = 1,1,1
Iterations = 8
ColorIterations = 2
#endpreset

#preset Twisted
FOV = 0.4
Eye = 0.18678,-2.50326,0.726368
Target = -1.17942,6.78003,-2.73109
Up = -0.925816,-0.244735,-0.288044
AntiAlias = 1
Detail = -2.60183
DetailAO = -0.63
FudgeFactor = 1
MaxRaySteps = 156
BoundingSphere = 18.181
Dither = 0.5
AO = 0,0,0,0.81
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.22857
SpotLightDir = -0.03614,0.1
CamLight = 1,1,1,1.32394
CamLightMin = 0.15294
Glow = 1,1,1,0.02174
Fog = 0.15748
HardShadow = 0.13846
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.
X = 0.5,0.6,0.6,0.2
Y = 1,0.6,0,0.2762
Z = 0.8,0.78,1,-0.08572
R = 0.666667,0.666667,0.498039,0.21154
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 4.27409
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 3.1
RotVector = 1,0.40816,0.18367
RotAngle = 2.1366
Offset = 1,0.95614,1
Iterations = 13
ColorIterations = 8
#endpreset

#preset Silver
FOV = 0.4
Eye = -0.16015,1.81406,0.598377
Target = 1.0002,-6.2196,-5.24233
Up = 0.708366,0.417383,-0.569218
AntiAlias = 1
Detail = -2.53981
DetailAO = -0.5
FudgeFactor = 0.80723
MaxRaySteps = 56
BoundingSphere = 2
Dither = 0.21053
AO = 0,0,0,0.45679
Specular = 2.5316
SpecularExp = 16
SpotLight = 1,1,1,0.03261
SpotLightDir = 0.65626,-0.3125
CamLight = 1,1,1,1.13978
CamLightMin = 0
Glow = 1,1,1,0.07895
Fog = 0.4161
HardShadow = 0.4
Reflection = 0.57692
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.219608,0.219608,0.160784
GradientBackground = 0.3
CycleColors = true
Cycles = 18.1816
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 3
RotVector = 1,1,1
RotAngle = 0
Offset = 1,1,1
Iterations = 8
ColorIterations = 8
#endpreset
