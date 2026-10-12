/**
 * Billboard quad around the sphere
 * @type {string}
 */

export const PLANET_VERTEX_SHADER = `#version 300 es
in vec2 aCorner;

uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uReach;

out vec2 vPlane;

void main() {
  vec2 pixel = vec2(uCenter.x + aCorner.x * uReach, uCenter.y - aCorner.y * uReach);
  vPlane = aCorner * uReach / uRadius;
  gl_Position = vec4(pixel.x / uResolution.x * 2.0 - 1.0, 1.0 - pixel.y / uResolution.y * 2.0, 0.0, 1.0);
}
`

/**
 * Lit planet: relief, bathymetric oceans with glint, drifting clouds
 * lit by a low sun at the terminator, city lights and a scattering atmosphere
 * @type {string}
 */

export const PLANET_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform mat3 uBasis;
uniform vec3 uSun;
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform sampler2D uHeight;
uniform vec2 uTexel;
uniform float uDrift;
uniform float uTime;
uniform float uRadius;
uniform float uGlow;
uniform float uPresence;
uniform float uRelief;

in vec2 vPlane;
out vec4 outColor;

const float PI = 3.14159265;
const float SEA_LEVEL = 0.275;
const vec3 RAYLEIGH = vec3(0.18, 0.45, 1.0);
const vec3 SUNSET = vec3(1.0, 0.42, 0.16);
const vec3 SUNLIGHT = vec3(1.0, 0.97, 0.92);

vec2 uvOf(vec3 v, float drift) {
  return vec2(atan(v.y, v.x) / (2.0 * PI) + 0.5 + drift, 0.5 - asin(clamp(v.z, -1.0, 1.0)) / PI);
}

// Gradients without the longitude seam
vec2 gradX;
vec2 gradY;

void gradientsOf(vec2 uv) {
  gradX = dFdx(uv);
  gradY = dFdy(uv);
  gradX.x -= floor(gradX.x + 0.5);
  gradY.x -= floor(gradY.x + 0.5);
}

vec4 tap(sampler2D map, vec2 uv) {
  return textureGrad(map, uv, gradX, gradY);
}

vec3 toLinear(vec3 c) {
  return c * c;
}


// Filmic curve, then display gamma
vec3 present(vec3 c) {
  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
  return sqrt(clamp(c, 0.0, 1.0));
}

// Low sun reddens the light
vec3 sunlightAt(float geo) {
  return mix(SUNSET, SUNLIGHT, smoothstep(-0.02, 0.38, geo));
}

void main() {
  float r = length(vPlane);
  vec3 sunView = uBasis * uSun;
  float edge = 1.5 / uRadius;

  // Surface point, gradients before any branch
  vec3 nView = vec3(vPlane, sqrt(max(1.0 - dot(vPlane, vPlane), 0.0)));
  vec3 n = nView * uBasis;
  vec3 viewDir = vec3(0.0, 0.0, 1.0) * uBasis;
  vec2 uv = uvOf(n, 0.0);
  gradientsOf(uv);

  // Atmosphere beyond the limb, blue by day, red at dusk
  float height = max(r - 1.0, 0.0);
  vec3 limb = vec3(vPlane / max(r, 1e-4), 0.0);
  float limbSun = dot(limb, sunView);
  float shell = exp(-height * 18.0) * 0.9 + exp(-height * 6.0) * 0.32;
  shell *= 1.0 - smoothstep(0.0, uGlow - 1.0, height);
  float limbLit = smoothstep(-0.45, 0.5, limbSun);
  float duskOffset = (limbSun + 0.12) / 0.2;
  float limbDusk = exp(-duskOffset * duskOffset);
  vec3 shellColor = mix(RAYLEIGH, vec3(0.7, 0.86, 1.0), exp(-height * 26.0));
  shellColor = mix(shellColor, SUNSET, limbDusk * 0.7);
  float shellAlpha = clamp(shell * (limbLit + limbDusk * 0.5), 0.0, 1.0);

  if (r >= 1.0 + edge) {
    outColor = vec4(shellColor * shellAlpha, shellAlpha) * uPresence;
    return;
  }

  float geo = dot(n, uSun);
  float facing = nView.z;

  // Land and sea from the height map
  float h = tap(uHeight, uv).r;
  float water = 1.0 - smoothstep(SEA_LEVEL - 0.012, SEA_LEVEL + 0.012, h);
  vec3 day = toLinear(tap(uDay, uv).rgb);

  // Terrain normal from height slopes
  float west = tap(uHeight, uv - vec2(uTexel.y, 0.0)).r;
  float east = tap(uHeight, uv + vec2(uTexel.y, 0.0)).r;
  float north = tap(uHeight, uv - vec2(0.0, uTexel.y)).r;
  float south = tap(uHeight, uv + vec2(0.0, uTexel.y)).r;
  vec3 eastward = normalize(vec3(-n.y, n.x, 0.0) + vec3(1e-5, 0.0, 0.0));
  vec3 northward = cross(n, eastward);
  vec2 slope = vec2(east - west, north - south) * (1.0 - water);
  vec3 bumped = normalize(n - (eastward * slope.x + northward * slope.y) * uRelief);

  // Sunlit land, slopes catch the low light
  float dayAmount = smoothstep(-0.12, 0.18, geo);
  vec3 light = sunlightAt(geo);
  float diffuse = max(dot(bumped, uSun), 0.0);
  float wrap = smoothstep(-0.15, 0.6, geo);
  vec3 land = day * light * (diffuse * 1.35 * wrap + 0.012);

  // Ocean, bathymetry tint and wind ruffled glint
  vec3 sea = day * light * (0.16 + 1.1 * max(geo, 0.0));
  vec2 rippleUv = uv * vec2(22.0, 44.0) + vec2(uTime * 0.003, uTime * 0.0015);
  float ripple = textureGrad(uClouds, rippleUv, gradX * 22.0, gradY * 44.0).g;
  vec3 waveNormal = normalize(n + (eastward * (ripple - 0.5) + northward * (0.5 - ripple)) * 0.025);
  vec3 halfway = normalize(uSun + viewDir);
  float spec = max(dot(waveNormal, halfway), 0.0);
  float glint = pow(spec, 700.0) * 0.9 + pow(spec, 90.0) * 0.16 + pow(spec, 16.0) * 0.04;
  float fresnel = 0.02 + 0.98 * pow(max(1.0 - facing, 0.0), 5.0);
  sea += light * glint * smoothstep(-0.02, 0.2, geo);
  sea = mix(sea, RAYLEIGH * 0.5 * dayAmount, fresnel * 0.6);

  vec3 surface = mix(land, sea, water);

  // Clouds on a raised shell, parallax near the limb
  float shellRadius = 1.012;
  vec3 cloudView = vec3(vPlane, sqrt(max(shellRadius * shellRadius - dot(vPlane, vPlane), 0.0))) / shellRadius;
  vec3 cloudNormal = cloudView * uBasis;
  float cloudRaw = tap(uClouds, uvOf(cloudNormal, uDrift)).r;
  float cover = smoothstep(0.5, 0.95, cloudRaw);
  float thick = smoothstep(0.55, 0.95, cloudRaw);

  // Cast shadow along the sun ray
  vec3 sunTangent = uSun - n * dot(uSun, n);
  vec3 shadowNormal = normalize(n + sunTangent * 0.012 / max(dot(uSun, n), 0.2));
  float shade = smoothstep(0.5, 0.95, tap(uClouds, uvOf(shadowNormal, uDrift)).r);
  surface *= 1.0 - shade * 0.35 * dayAmount;

  // Cloud tops, pink at dusk, grey under moonlight
  float cloudGeo = dot(cloudNormal, uSun);
  vec3 cloudLit = sunlightAt(cloudGeo) * (0.25 + 1.05 * smoothstep(-0.12, 0.55, cloudGeo));
  cloudLit *= mix(1.0, 0.78, thick * (1.0 - smoothstep(0.0, 0.5, cloudGeo)));
  vec3 cloudNight = vec3(0.012, 0.018, 0.035);
  vec3 cloudColor = mix(cloudNight, cloudLit, smoothstep(-0.16, 0.06, cloudGeo));
  surface = mix(surface, cloudColor, cover * 0.55);

  // City lights, bloomed, dimmed by cloud
  float nightAmount = 1.0 - smoothstep(-0.16, 0.06, geo);
  vec3 night = toLinear(tap(uNight, uv).rgb);
  vec3 bloom = toLinear((
    tap(uNight, uv + vec2(uTexel.x * 5.0, 0.0)).rgb +
    tap(uNight, uv - vec2(uTexel.x * 5.0, 0.0)).rgb +
    tap(uNight, uv + vec2(0.0, uTexel.x * 5.0)).rgb +
    tap(uNight, uv - vec2(0.0, uTexel.x * 5.0)).rgb
  ) * 0.25);
  float lamp = smoothstep(0.02, 0.5, max(night.r, night.g) - night.b * 0.4);
  float halo = smoothstep(0.01, 0.3, max(bloom.r, bloom.g) - bloom.b * 0.4);
  vec3 sodium = mix(vec3(1.0, 0.5, 0.16), vec3(1.0, 0.86, 0.6), lamp);
  float twinkle = 0.9 + 0.1 * sin(uTime * 2.2 + (uv.x * 631.0 + uv.y * 977.0));
  vec3 lights = sodium * (lamp * 3.0 * twinkle + halo * 0.7) * (1.0 - water * 0.85);
  vec3 moonlit = night * vec3(0.5, 0.6, 1.0) * 0.55 + day * 0.006;
  surface += (lights * (1.0 - cover * 0.85) + moonlit * (1.0 - cover)) * nightAmount;

  // Aerial haze thickening towards the limb
  float haze = pow(max(1.0 - facing, 0.0), 2.6);
  float hazeLit = smoothstep(-0.25, 0.45, geo);
  vec3 hazeColor = mix(SUNSET * 0.9, RAYLEIGH, smoothstep(-0.05, 0.35, geo));
  surface = mix(surface, hazeColor * hazeLit * 0.9, haze * 0.35 * hazeLit);
  surface += RAYLEIGH * (0.01 + 0.025 * hazeLit) * (1.0 - facing);

  vec3 color = present(surface * 1.15);
  float body = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, r);
  color = color * body + shellColor * shellAlpha * (1.0 - body);
  float alpha = body + shellAlpha * (1.0 - body);
  outColor = vec4(color, alpha) * uPresence;
}
`
