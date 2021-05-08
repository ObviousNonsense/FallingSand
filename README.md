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

## To Do:
- Add button to reset sim
- Add button to resize canvas
- Clean up UI
- Add Particle types?:
    - Smoke
    - Ice
- Improve performance? I've tried multiple things to increase the number of particles that can be drawn without dropping frames, but I think I'm at the limit of what I can do with p5/HTML canvas.