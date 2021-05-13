# Falling Sand Sim

Just a basic falling sand simulator I'm making for fun to practise p5/processing, Javascript, and maybe some HTML & CSS.

[You can play with it here](https://obviousnonsense.github.io/FallingSand/)

## Particle Types:
- Stone Walls: Stops other things.
- Wood Walls: Stops other things. Burns.
- Sand: Falls. Piles up. Sinks in & displaces water.
- Water: Flows. Evaporates into steam when burned.
- Steam: Floats. Condensates into water.
- Plants: Consumes water and grows in weird patterns. Burns.
- Fire: Burns things.
- Gasoline: Like water, but a little lighter and burns.
- Hydrogen: Like Gasoline, but a gas. Lighter than steam.
- Gunpowder: Basically flammable sand.

## To Do:
- Clean up UI
- Add Particles/Mechanics:
    - Smoke
    - Ice
    - Stones/Wood that falls
    - Concussive explosions/pressure/momentum
    - Ash? Charred wood?
    - Have sources be tunable
      - Option to replace
      - Tunable frequency/quantity/likelihood
      - Create particles in an area instead of around the edges (i.e. the source itself would not take up space)
    - <s>Make fire a method instead of a particle type, then have it reduce the fuel of whatever it's burning
      - That way the particle will still move/act like itself,
      - And the particle that's burning will still be there if the fire is put out</s>
- Ability to replace all particles of one type with another type (or fill)
- Improve performance? I've tried multiple things to increase the number of particles that can be drawn without dropping frames, but I think I'm at the limit of what I can do with p5/HTML canvas.

## Particle Inheritance Tree:

<pre>
Particle
├ ParticleSink
├ ParticleSource
├ WallParticle
├ IndestructibleWallParticle
├ WoodParticle
├ FireParticle
  ├ FlameParticle
├ PlantParticle
├ Moveable Particle
  ├ SandParticle
    ├ GunpowderParticle
  ├ FluidParticle
    ├ WaterParticle
    ├ SteamParticle
    ├ GasolineParticle
    ├ Hydrogen Particle
</pre>

