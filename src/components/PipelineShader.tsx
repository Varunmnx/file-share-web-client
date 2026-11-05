import { useEffect, useRef } from "react";

const VERTEX_SHADER_SOURCE = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

uniform vec2 u_resolution; uniform float u_ref_height; uniform float u_time;
uniform vec3 u_colors[8]; uniform int u_colorCount;
uniform float u_flow_type; uniform float u_zoom;
uniform vec2 u_pan; uniform float u_flow_speed; uniform float u_liquid_str;
uniform float u_morph; uniform float u_rotation;
uniform bool u_enable_art;
uniform float u_art_type;
uniform float u_art_size;
uniform float u_art_shape;
uniform float u_art_contrast;
uniform vec3 u_overlay_color;
uniform sampler2D u_bg_texture;
uniform int u_has_bg_texture;
uniform int u_color_mode;
uniform float u_blend_bias;
uniform float u_blend_sharp;

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// --- Dithering Functions ---
float dither_2x2(vec2 p) {
    vec2 p1 = mod(p, 2.0);
    return mod(p1.x * 2.0 + p1.y * 3.0, 4.0) / 4.0;
}
float dither_4x4(vec2 p) {
    vec2 p1 = mod(p, 2.0);
    vec2 p2 = mod(floor(p / 2.0), 2.0);
    float b1 = mod(p1.x * 2.0 + p1.y * 3.0, 4.0);
    float b2 = mod(p2.x * 2.0 + p2.y * 3.0, 4.0);
    return (b1 * 4.0 + b2) / 16.0;
}
float dither_8x8(vec2 p) {
    vec2 p1 = mod(p, 2.0);
    vec2 p2 = mod(floor(p / 2.0), 2.0);
    vec2 p3 = mod(floor(p / 4.0), 2.0);
    float b1 = mod(p1.x * 2.0 + p1.y * 3.0, 4.0);
    float b2 = mod(p2.x * 2.0 + p2.y * 3.0, 4.0);
    float b3 = mod(p3.x * 2.0 + p3.y * 3.0, 4.0);
    return (b1 * 16.0 + b2 * 4.0 + b3) / 64.0;
}

// --- SDF Functions ---
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdHexagon(vec2 p, float r) { const vec3 k = vec3(-0.866025404, 0.5, 0.577350269); p = abs(p); p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy; p -= vec2(clamp(p.x, -k.z * r, k.z * r), r); return length(p) * sign(p.y); }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdEquilateralTriangle(vec2 p, float r) { const float k = sqrt(3.0); p.x = abs(p.x) - r; p.y = p.y + r / k; if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0; p.x -= clamp(p.x, -2.0 * r, 0.0); return -length(p) * sign(p.y); }

// --- Simplex Noise 2D ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float simplexNoise2D(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float noise(in vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}
float snoise(vec2 st) { return noise(st) * 2.0 - 1.0; }
float fbm(vec2 p) {
    float f = 0.0; float amp = 0.5;
    mat2 rot2 = mat2(cos(0.65), sin(0.65), -sin(0.65), cos(0.65));
    for (int i = 0; i < 4; i++) { f += amp * noise(p); p = rot2 * p * 2.01; amp *= 0.5; }
    return f;
}
float sfbm(vec2 p) { return fbm(p) * 2.0 - 1.0; }

// --- OKLab / OKLch Color Space ---
vec3 srgbToLinear(vec3 c) {
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c));
}
vec3 linearToOklab(vec3 c) {
    float l = 0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b;
    float m = 0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b;
    float s = 0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b;
    float l_ = pow(max(l, 0.0), 1.0/3.0);
    float m_ = pow(max(m, 0.0), 1.0/3.0);
    float s_ = pow(max(s, 0.0), 1.0/3.0);
    return vec3(
        0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
        1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
        0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
    );
}
vec3 oklabToLinear(vec3 c) {
    float l_ = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
    float m_ = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
    float s_ = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
    float l = l_*l_*l_;
    float m = m_*m_*m_;
    float s = s_*s_*s_;
    return vec3(
        +4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
        -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
        -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    );
}
vec3 oklabToOklch(vec3 lab) {
    float C = length(lab.yz);
    float H = atan(lab.z, lab.y);
    return vec3(lab.x, C, H);
}
vec3 oklchToOklab(vec3 lch) {
    return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

float applyBlend(float t) {
    float gamma;
    if (u_blend_bias < 0.5) {
        gamma = 1.0 + (1.0 - u_blend_bias * 2.0) * 3.0;
    } else {
        gamma = 1.0 - (u_blend_bias - 0.5) * 2.0 * 0.75;
    }
    gamma = max(gamma, 0.1);
    float biased = pow(clamp(t, 0.001, 0.999), gamma);
    float halfRange = 0.5 - u_blend_sharp * 0.48;
    return smoothstep(0.5 - halfRange, 0.5 + halfRange, biased);
}

vec3 mixOklab(vec3 a, vec3 b, float t) {
    float bt = applyBlend(t);
    if (u_color_mode == 0) {
        return mix(a, b, bt);
    }
    if (u_color_mode == 2) {
        vec3 labA = linearToOklab(srgbToLinear(a));
        vec3 labB = linearToOklab(srgbToLinear(b));
        return linearToSrgb(oklabToLinear(mix(labA, labB, bt)));
    }
    vec3 lchA = oklabToOklch(linearToOklab(srgbToLinear(a)));
    vec3 lchB = oklabToOklch(linearToOklab(srgbToLinear(b)));
    float L = mix(lchA.x, lchB.x, bt);
    float C = mix(lchA.y, lchB.y, bt);
    float dH = lchB.z - lchA.z;
    if (dH >  3.14159265) dH -= 6.28318530;
    if (dH < -3.14159265) dH += 6.28318530;
    float H = lchA.z + dH * bt;
    return linearToSrgb(oklabToLinear(oklchToOklab(vec3(L, C, H))));
}

void main() {
    vec2 originalFragCoord = gl_FragCoord.xy;
    vec2 fragCoord = originalFragCoord;
    vec2 blockId = floor(fragCoord / u_art_size);

    if (u_enable_art) {
        fragCoord = blockId * u_art_size + (u_art_size * 0.5);
    }

    vec2 uv = fragCoord / u_resolution.xy;
    vec2 S = uv - 0.5;
    S.x *= u_resolution.x / u_resolution.y;
    S *= u_resolution.y / u_ref_height;
    vec2 p = S / u_zoom + u_pan;
    p += 0.5;

    float t = u_time * u_flow_speed;
    vec3 finalColor = u_colors[0];

    // ── Branch 1: Fluid Dynamics (0–5) ──
    if (u_flow_type < 5.5) {
        if (u_flow_type < 0.5) {
            p += 0.2 * vec2(sin(t + p.y * 3.0), cos(t + p.x * 3.0));
            p += 0.2 * vec2(sin(t * 0.5 + p.y * 5.0), cos(t * 0.8 + p.x * 5.0));
        } else if (u_flow_type < 1.5) {
            p.x += 0.2 * snoise(vec2(p.y * 3.0 + t, p.x * 0.5));
            p.y += 0.2 * snoise(vec2(p.x * 3.0 + t, p.y * 0.5));
            p.x += 0.15 * snoise(vec2(p.y * 5.0 - t * 0.5, p.x * 0.8));
            p.y += 0.15 * snoise(vec2(p.x * 5.0 - t * 0.5, p.y * 0.8));
        } else if (u_flow_type < 2.5) {
            p.x += 0.2 * sfbm(vec2(p.y * 2.0 + t, p.x * 0.5));
            p.y += 0.2 * sfbm(vec2(p.x * 2.0 + t, p.y * 0.5));
            p.x += 0.1 * sfbm(vec2(p.y * 4.0 - t * 0.8, p.x * 1.5));
            p.y += 0.1 * sfbm(vec2(p.x * 4.0 - t * 0.8, p.y * 1.5));
        } else if (u_flow_type < 3.5) {
            vec2 offset; offset.x = fbm(p * 3.0 + vec2(t * 0.2, 0.0)); offset.y = fbm(p * 3.0 + vec2(0.0, t * 0.3));
            p += offset * 1.5;
        } else if (u_flow_type < 4.5) {
            for(int i=0; i<3; i++) {
                vec2 v = vec2(sfbm(p.yx * 2.0 + t), -sfbm(p.xy * 2.0 - t)); p += v * 0.3;
                mat2 rot2 = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5)); p = rot2 * p;
            }
        } else {
            vec2 centerP = p - 0.5; float radius = length(centerP); float ang = atan(centerP.y, centerP.x);
            ang += t * 1.0 / (radius + 0.2); ang += sfbm(p * 3.0) * 0.5;
            p = vec2(radius * cos(ang), radius * sin(ang)); p += 0.5; p *= 1.5;
        }
        float distortion = noise(p * 2.0 + t * 0.5) * u_liquid_str;
        for (int i = 1; i < 8; i++) {
            if (i < u_colorCount) {
                float fi = float(i); float mixLayer = 0.0;
                if (mod(fi, 2.0) != 0.0) mixLayer = 0.5 + 0.5 * sin(p.x * (4.0 + fi * 0.5) + t + distortion * 3.0);
                else mixLayer = 0.5 + 0.5 * cos(p.y * (4.0 + fi * 0.5) - t + distortion * 3.0);
                float layerStrength = 1.0 - (fi * 0.1); if (i == 2) layerStrength = 0.8;
                layerStrength = clamp(layerStrength, 0.4, 1.0);
                finalColor = mixOklab(finalColor, u_colors[i], mixLayer * layerStrength);
            }
        }
    }
    // ── Branch 2: Structured Mapping (6–8) ──
    else if (u_flow_type < 8.5) {
        vec2 waveOffset = vec2(
            sfbm(p * 2.0 + vec2(t * 0.2, 0.0)),
            sfbm(p * 2.0 + vec2(0.0, t * 0.2))
        ) * (u_liquid_str * 0.1);
        vec2 distP = p + waveOffset;
        distP -= 0.5;
        distP *= rot(u_rotation);
        distP += 0.5;
        float M = 0.0;
        if (u_flow_type < 6.5) {
            float waveAmp = u_morph * 0.2;
            float waveFreq = 10.0 + u_morph * 10.0;
            distP.y += sin(distP.x * waveFreq + t) * waveAmp;
            M = distP.y;
        } else if (u_flow_type < 7.5) {
            vec2 centerP = distP - 0.5;
            float d1 = sdCircle(centerP, 0.3);
            float d2 = sdHexagon(centerP, 0.3);
            float d3 = sdBox(centerP, vec2(0.25));
            float d4 = sdEquilateralTriangle(centerP * vec2(1.0, -1.0) - vec2(0.0, 0.1), 0.35);
            float morphVal = u_morph * 3.0;
            float finalD = 0.0;
            if (morphVal < 1.0) finalD = mix(d1, d2, morphVal);
            else if (morphVal < 2.0) finalD = mix(d2, d3, morphVal - 1.0);
            else finalD = mix(d3, d4, morphVal - 2.0);
            M = finalD * 4.0 - t * 0.05;
            M = abs(mod(M, 2.0) - 1.0);
        } else {
            float ang = atan(distP.y - 0.5, distP.x - 0.5);
            M = fract((ang / 6.28318) + 0.5 + t * 0.05);
        }
        bool isLooping = (u_flow_type > 7.5);
        float segments = isLooping ? float(u_colorCount) : float(u_colorCount - 1);
        float segmentVal = clamp(M, 0.0, 1.0) * segments;
        vec3 col = u_colors[0];
        for(int i = 0; i < 8; i++) {
            if (i < u_colorCount) {
                bool isLast = (i == u_colorCount - 1);
                if (isLooping || !isLast) {
                    float mask = smoothstep(float(i), float(i) + 1.0, segmentVal);
                    vec3 nextColor = isLast ? u_colors[0] : u_colors[i+1];
                    col = mixOklab(col, nextColor, mask);
                }
            }
        }
        finalColor = col;
    }
    // ── Branch 3: Diffusion (9–10) ──
    else if (u_flow_type < 10.5) {
        vec2 flowUV = uv;
        float amt = u_liquid_str * 0.05;
        float freq = 3.0;
        for (int i = 0; i < 4; i++) {
            float noiseVal = snoise(vec2(flowUV.x * freq + t * 0.5, flowUV.y * freq - t * 0.5));
            float ang = noiseVal * 3.14159 * 2.0;
            flowUV += vec2(cos(ang), sin(ang)) * amt;
        }
        if (u_flow_type < 9.5) {
            if (u_has_bg_texture == 1) {
                vec4 texColor = texture2D(u_bg_texture, clamp(flowUV, 0.0, 1.0));
                finalColor = texColor.rgb;
            } else {
                finalColor = mixOklab(u_colors[0], u_colors[1], snoise(flowUV * 4.0) * 0.5 + 0.5);
            }
        } else {
            vec3 colAcc = vec3(0.0);
            float weightAcc = 0.0;
            for (int i = 0; i < 8; i++) {
                if (i >= u_colorCount) break;
                float fi = float(i);
                vec2 center = vec2(0.5) + vec2(
                    sin(t * 0.8 + fi * 2.1) * 0.3,
                    cos(t * 0.6 + fi * 1.7) * 0.3
                );
                float dist = length(flowUV - center);
                float weight = 1.0 / (pow(dist, 2.5) + 0.001);
                vec3 c = (u_color_mode == 1)
                    ? linearToOklab(srgbToLinear(u_colors[i]))
                    : u_colors[i];
                colAcc += c * weight;
                weightAcc += weight;
            }
            finalColor = (u_color_mode == 1)
                ? linearToSrgb(oklabToLinear(colAcc / weightAcc))
                : colAcc / weightAcc;
        }
    }
    // ── Branch 4: SDF Topology (11–12) ──
    else if (u_flow_type < 11.5) {
        // 11: Nested SDF Shape (Core Glow)
        vec2 flowP = p;
        float amt = u_liquid_str * 0.15;
        for (int i = 0; i < 3; i++) {
            float ang = snoise(flowP * 2.0 + t * 0.2) * 3.14159;
            flowP += vec2(cos(ang), sin(ang)) * amt;
            amt *= 0.7;
        }
        vec2 centerP = flowP - 0.5;
        centerP *= rot(u_rotation);
        float d1 = sdCircle(centerP, 0.3);
        float d2 = sdHexagon(centerP, 0.3);
        float d3 = sdBox(centerP, vec2(0.25));
        float d4 = sdEquilateralTriangle(centerP * vec2(1.0, -1.0) - vec2(0.0, 0.1), 0.35);
        float morphVal = u_morph * 3.0;
        float finalD = 0.0;
        if (morphVal < 1.0) finalD = mix(d1, d2, morphVal);
        else if (morphVal < 2.0) finalD = mix(d2, d3, morphVal - 1.0);
        else finalD = mix(d3, d4, morphVal - 2.0);
        finalColor = u_colors[0];
        for (int i = 1; i < 8; i++) {
            if (i < u_colorCount) {
                float ratio = float(i) / float(u_colorCount - 1);
                float targetR = ratio * 1.5;
                float mask = smoothstep(targetR - 0.35, targetR + 0.35, finalD);
                finalColor = mixOklab(finalColor, u_colors[i], mask);
            }
        }
    }
    else {
        // 12: 3D Liquid Depth
        vec2 flowP = p;
        float amt = u_liquid_str * 0.05;
        float freq = 2.0;
        float cavity = 0.0;
        for (int i = 0; i < 4; i++) {
            float noiseVal = snoise(vec2(flowP.x * freq + t * 0.4, flowP.y * freq - t * 0.4));
            float ang = noiseVal * 3.14159 * 2.0;
            float noiseOffset = snoise(vec2((flowP.x + 0.05) * freq + t * 0.4, flowP.y * freq - t * 0.4));
            cavity += (noiseVal - noiseOffset);
            flowP += vec2(cos(ang), sin(ang)) * amt;
        }
        vec2 centerP = flowP - 0.5;
        centerP *= rot(u_rotation);
        float d1 = sdCircle(centerP, 0.3);
        float d2 = sdHexagon(centerP, 0.3);
        float d3 = sdBox(centerP, vec2(0.25));
        float d4 = sdEquilateralTriangle(centerP * vec2(1.0, -1.0) - vec2(0.0, 0.1), 0.35);
        float morphVal = u_morph * 3.0;
        float dist = 0.0;
        if (morphVal < 1.0) dist = mix(d1, d2, morphVal);
        else if (morphVal < 2.0) dist = mix(d2, d3, morphVal - 1.0);
        else dist = mix(d3, d4, morphVal - 2.0);
        float depthFactor = smoothstep(-0.2, 0.8, cavity);
        finalColor = u_colors[0];
        float maxRadius = 0.60;
        float blur = 0.18;
        for (int i = 1; i < 8; i++) {
            if (i >= u_colorCount) break;
            float r = maxRadius * (1.0 - float(i) / float(u_colorCount));
            float shiftedDist = dist - depthFactor * 0.15;
            float mask = 1.0 - smoothstep(r - blur, r + blur, shiftedDist);
            vec3 blendColor = u_colors[i];
            if (i < u_colorCount - 1) {
                blendColor = mixOklab(u_colors[i], u_colors[i+1], depthFactor * 0.5);
            }
            finalColor = mixOklab(finalColor, blendColor, mask);
        }
    }

    // ── Stage 4: Halftone Effect ──
    if (u_enable_art) {
        float luminance = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
        float minLum = 1.0;
        float maxLum = 0.0;
        for (int i = 0; i < 8; i++) {
            if (i >= u_colorCount) break;
            float l = dot(u_colors[i], vec3(0.2126, 0.7152, 0.0722));
            minLum = min(minLum, l);
            maxLum = max(maxLum, l);
        }
        float range = maxLum - minLum;
        if (range > 0.001) { luminance = (luminance - minLum) / range; }

        float ditherVal;
        if (u_art_type < 0.5) ditherVal = random(blockId);
        else if (u_art_type < 1.5) ditherVal = dither_2x2(blockId);
        else if (u_art_type < 2.5) ditherVal = dither_4x4(blockId);
        else ditherVal = dither_8x8(blockId);

        float c = u_art_contrast / 100.0;
        float lowerBound = max(mix(0.0, 0.48, c), 0.01);
        float upperBound = min(mix(1.0, 0.52, c), 0.95);
        float density = smoothstep(lowerBound, upperBound, 1.0 - luminance);

        vec3 symbolColor = u_colors[2];
        vec3 bgColor = vec3(1.0);
        bool isFilled = (density > ditherVal);

        if (u_art_shape < 0.5) {
            finalColor = isFilled ? symbolColor : bgColor;
        } else {
            vec2 blockLocalUv = fract(originalFragCoord / u_art_size) - 0.5;
            float shapeMask = 0.0;
            float baseRadius = 0.5;
            if (u_art_shape < 1.5) {
                shapeMask = step(length(blockLocalUv), baseRadius);
            } else if (u_art_shape < 2.5) {
                float k = sqrt(3.0);
                vec2 tp = blockLocalUv;
                tp.y += baseRadius * 0.5;
                tp.x = abs(tp.x) - baseRadius;
                tp.y = tp.y + baseRadius / k;
                if (tp.x + k * tp.y > 0.0) tp = vec2(tp.x - k * tp.y, -k * tp.x - tp.y) / 2.0;
                tp.x -= clamp(tp.x, -2.0 * baseRadius, 0.0);
                float d = -length(tp) * sign(tp.y);
                shapeMask = smoothstep(0.02, 0.00, d);
            } else if (u_art_shape < 3.5) {
                float thickness = baseRadius * 0.3;
                float h = step(-baseRadius, blockLocalUv.x) * step(blockLocalUv.x, baseRadius) * step(-thickness, blockLocalUv.y) * step(blockLocalUv.y, thickness);
                float v = step(-thickness, blockLocalUv.x) * step(blockLocalUv.x, thickness) * step(-baseRadius, blockLocalUv.y) * step(blockLocalUv.y, baseRadius);
                shapeMask = max(h, v);
            } else {
                float thickness = baseRadius * 0.4;
                shapeMask = step(-thickness, blockLocalUv.x) * step(blockLocalUv.x, thickness);
            }
            finalColor = (isFilled && shapeMask > 0.5) ? symbolColor : bgColor;
        }
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const COLORS = ["#f0d1de", "#3859d9"];
const FLOW_TYPE = 11;
const ZOOM = 13 * 0.028 + 0.2;
const FLOW_SPEED = 67 * 0.02;
const LIQUID_STR = 89 * 0.02;
const MORPH = (65 / 100.0) * 3.0;
const ROTATION = 299 * (Math.PI / 180.0);
const ART_ENABLE = 0;
const ART_TYPE = 3;
const ART_SIZE = 6;
const ART_SHAPE = 1;
const ART_CONTRAST = 40;

interface PipelineShaderProps {
  className?: string;
  enableGrain?: boolean;
}

export default function PipelineShader({
  className = "",
  enableGrain = true,
}: PipelineShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Generate noise grain overlay
    if (enableGrain && overlayRef.current) {
      const nc = document.createElement("canvas");
      nc.width = 256;
      nc.height = 256;
      const nctx = nc.getContext("2d");
      if (nctx) {
        const img = nctx.createImageData(256, 256);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = Math.random() * 255;
          img.data[i] = v;
          img.data[i + 1] = v;
          img.data[i + 2] = v;
          img.data[i + 3] = 255;
        }
        nctx.putImageData(img, 0, 0);
        overlayRef.current.style.backgroundImage = `url(${nc.toDataURL()})`;
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: false, alpha: false });
    if (!gl) return;

    function createShader(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const pos = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pos);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
    const HAS_BG = 0;

    const loc = (n: string) => gl.getUniformLocation(program, n);
    let refHeight = 0;

    const resize = () => {
      const dpr = Math.min(Math.max(1.5, window.devicePixelRatio || 1), 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        if (!refHeight) refHeight = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    // Pre-parse color floats
    const cd = new Float32Array(8 * 3);
    COLORS.forEach((hex, i) => {
      cd[i * 3] = parseInt(hex.slice(1, 3), 16) / 255;
      cd[i * 3 + 1] = parseInt(hex.slice(3, 5), 16) / 255;
      cd[i * 3 + 2] = parseInt(hex.slice(5, 7), 16) / 255;
    });

    const uRes = loc("u_resolution");
    const uRefH = loc("u_ref_height");
    const uTime = loc("u_time");
    const uColCount = loc("u_colorCount");
    const uColors = loc("u_colors");
    const uFlowType = loc("u_flow_type");
    const uZoom = loc("u_zoom");
    const uPan = loc("u_pan");
    const uFlowSpeed = loc("u_flow_speed");
    const uLiquidStr = loc("u_liquid_str");
    const uMorph = loc("u_morph");
    const uRotation = loc("u_rotation");
    const uEnableArt = loc("u_enable_art");
    const uArtType = loc("u_art_type");
    const uArtSize = loc("u_art_size");
    const uArtShape = loc("u_art_shape");
    const uArtContrast = loc("u_art_contrast");
    const uBgTex = loc("u_bg_texture");
    const uHasBg = loc("u_has_bg_texture");
    const uColorMode = loc("u_color_mode");
    const uBlendBias = loc("u_blend_bias");
    const uBlendSharp = loc("u_blend_sharp");

    let isRunning = true;

    function render(now: number) {
      if (!isRunning) return;
      const time = now * 0.001;

      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uRefH, refHeight || canvas!.height);
      gl!.uniform1f(uTime, time);
      gl!.uniform1i(uColCount, COLORS.length);
      gl!.uniform3fv(uColors, cd);
      gl!.uniform1f(uFlowType, FLOW_TYPE);
      gl!.uniform1f(uZoom, ZOOM);
      gl!.uniform2f(uPan, 1.256, 0.502);
      gl!.uniform1f(uFlowSpeed, FLOW_SPEED);
      gl!.uniform1f(uLiquidStr, LIQUID_STR);
      gl!.uniform1f(uMorph, MORPH);
      gl!.uniform1f(uRotation, ROTATION);
      gl!.uniform1i(uEnableArt, ART_ENABLE);
      gl!.uniform1f(uArtType, ART_TYPE);
      gl!.uniform1f(uArtSize, ART_SIZE);
      gl!.uniform1f(uArtShape, ART_SHAPE);
      gl!.uniform1f(uArtContrast, ART_CONTRAST);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.uniform1i(uBgTex, 0);
      gl!.uniform1i(uHasBg, HAS_BG);
      gl!.uniform1i(uColorMode, 2);
      gl!.uniform1f(uBlendBias, 0.01);
      gl!.uniform1f(uBlendSharp, 0);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteTexture(tex);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [enableGrain]);

  return (
    <div
      className={`pipeline-shader-wrapper ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {enableGrain && (
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            backgroundSize: "128px 128px",
            pointerEvents: "none",
            zIndex: 1,
            mixBlendMode: "overlay",
            opacity: 0.192,
          }}
        />
      )}
    </div>
  );
}

