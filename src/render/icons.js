/* symboles tactiques : croix = infanterie, arc + point = tir indirect,
   caisson sur pattes = marcheur, ovale = blindé, oblique = rapide */
export const I={
 tac:'<path d="M4.5 6 19.5 18M19.5 6 4.5 18"/>',
 asl:'<path d="M5.5 9.5 18.5 19M18.5 9.5 5.5 19"/><path d="M3.5 7q8.5-5.5 17 0"/>',
 dev:'<path d="M2.5 14.5Q12 1.5 21.5 14.5"/><circle class="f" cx="12" cy="16.5" r="3.5"/>',
 dre:'<path d="M6.5 4.5h11v8.5h-11z"/><path d="M9.5 13 5.5 21M14.5 13l4 8"/>',
 pre:'<ellipse cx="12" cy="12" rx="9" ry="5.6"/><path d="M3.4 12h17.2"/>',
 spe:'<ellipse cx="12" cy="12" rx="9" ry="5.6"/><path d="M3.5 19 20.5 5"/>',
 boy:'<path d="M5 6.5 19 17.5M19 6.5 5 17.5"/><path d="M8 21h8"/>',
 nob:'<path d="M5 5.5 19 16.5M19 5.5 5 16.5"/><path d="M3.5 20.5h17"/>',
 loo:'<path d="M2.5 14.5Q12 1.5 21.5 14.5"/><circle class="f" cx="12" cy="16.5" r="3.5"/>',
 ddr:'<path d="M6.5 4.5h11v8.5h-11z"/><path d="M9.5 13 5.5 21M14.5 13l4 8"/><path d="M17.5 4 21.5 6.5"/>',
 bug:'<ellipse cx="12" cy="12" rx="9" ry="5.6"/><path d="M3.5 19 20.5 5"/>',
 bat:'<ellipse cx="12" cy="12" rx="9" ry="5.6"/><path d="M3.4 12h17.2"/><path d="M12 6.6v10.8"/>'
};
export const svg=t=>'<svg viewBox="0 0 24 24">'+I[t]+'</svg>';
