const apiRemove = (context) => ({
  remove: (selection) => {
    selection.on('mousemove.horizon', null).on('mouseout.horizon', null);

    const remove = (d) => {
      d.metric.on('change.horizon-' + d.id, null);
      context.on('change.horizon-' + d.id, null);
      context.on('focus.horizon-' + d.id, null);
    };

    selection.selectAll('canvas').each(remove).remove();

    selection
      .selectAll(
        '.' + context.getCSSClass('title') + ',.' + context.getCSSClass('value')
      )
      .remove();
  },
});

export default apiRemove;
