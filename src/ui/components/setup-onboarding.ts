import {LocalStorageHelper} from '../../helpers/local-storage-helper';
import {SETUP_ICON_DATA_URI} from '../ui-assets';
import {buildGameUrl,buildForumThreadUrl} from '../../helpers/game-url-helper';
import {PageContext} from '../../helpers/script-context';
import {ensureOrganizerStyles} from './organizer-style';
import {dockOrganizerPanel, layoutOrganizerDocks} from './organizer-dock';
import {SETUP_TOUR_KEY, getCatalogCheck, isCatalogSelectionValid, refreshGameCatalogs} from '../../helpers/game-catalog';

// A shared tour key deliberately survives context and role changes. Existing page tours remain intact.
const SETUP_KEY = SETUP_TOUR_KEY;

function needsSetup(storage:LocalStorageHelper):boolean {
    return !/^[1-9]\d*$/.test(storage.getSdGroupId) || !/^[1-9]\d*$/.test(storage.getSelectedTemplate)
        || !Number.isFinite(storage.getSwordLfz) || storage.getSwordLfz<=0;
}
type SetupStep = {title:string; text:string; tip:string; screen:string; mode?:string; type?:string; target?:string; link:string};
export const setupSteps:SetupStep[] = [
    {title:'SD-Gruppe erstellen', screen:'overview_villages', mode:'groups', type:'static', target:'#add_new_group_name', link:'Gruppen öffnen',
        text:'Lege im Spiel eine Dorfgruppe „SD“ an. Ordne ihr die Dörfer zu, aus denen du Standdeff schicken möchtest. Eine vorhandene passende Gruppe kannst du weiterverwenden.',
        tip:'Speichere die Gruppe im Spiel. Wähle sie danach hier aus und klicke „Als SD-Gruppe festlegen“. Eine bereits vorhandene passende Gruppe kannst du genauso verwenden. „Weiter“ wird erst nach erfolgreicher Prüfung freigegeben.'},
    {title:'SD-Vorlage anlegen', screen:'place', mode:'templates', target:'#template_name', link:'Truppen-Vorlagen öffnen',
        text:'Lege eine Truppen-Vorlage für ein SD-Paket an. Verwende die Mengen aus der SD-Tabelle deines Stammes: Speer und Schwert, auf Bogenwelten gegebenenfalls Bogen, dazu die vereinbarten Späher.',
        tip:'Zum Beispiel 100 Speer + 100 Schwert + 5 Späher für 100 Dual. Speichere im Spiel und lege die Vorlage hier als SD-Vorlage fest. Der Organizer prüft ihre Existenz direkt; ein Besuch auf Massen-UT zum Einlesen ist nicht nötig.'},
    {title:'SD-Gruppe auswählen', screen:'settings', target:'#sd-group-id', link:'Organizer-Einstellungen öffnen',
        text:'Wähle in den Organizer-Einstellungen deine SD-Gruppe. Beim Öffnen einer SD-Anfrage wird diese Gruppe für die Herkunftsdörfer verwendet.',
        tip:'Eine gerade im Onboarding angelegte Gruppe ist schon vorausgewählt. Prüfe sie oder wähle eine vorhandene. Die Liste wird direkt aus der Gruppenverwaltung aktualisiert.'},
    {title:'SD-Vorlage auswählen', screen:'settings', target:'#sd-template-id', link:'Organizer-Einstellungen öffnen',
        text:'Wähle die eben angelegte SD-Vorlage. Sie bestimmt die Einheitenmenge pro Paket und wird bei aktiver Vorbereitung für SD-Anfragen ausgewählt.',
        tip:'Kontrolliere die Mengen deiner Vorlage gegen die SD-Tabelle. Unterschiedliche Paketgrößen brauchen jeweils passende Vorlagen.'},
    {title:'Massen-UT vorbereiten', screen:'settings', target:'#automate-massen-ut', link:'Organizer-Einstellungen öffnen',
        text:'Schalte „Massen-UT automatisch vorbereiten“ auf „An“, wenn der Organizer deine Vorlage, Gruppe und Filter beim Öffnen einer SD-Anfrage anwenden soll.',
        tip:'„Aus“ lässt diese Auswahl dir. „An“ bereitet das Formular vor; du prüfst die Truppen und sendest selbst im Spiel.'},
    {title:'Doppeltes Schicken verstehen', screen:'settings', target:'#prevent-duplicate-destination', link:'Organizer-Einstellungen öffnen',
        text:'„Doppeltes Schicken: Aus“ schützt bereits bearbeitete Anfragen vor erneuter Vorauswahl. „An“ erlaubt, dieselbe Anfrage noch einmal zu bedienen.',
        tip:'Für die normale Einrichtung lasse den Schalter auf „Aus“. Es geht um bereits bearbeitete SD-Anfragen, nicht um jedes beliebige Unterstützen desselben Dorfes.'},
    {title:'Sortierung wählen', screen:'settings', target:'#sd-sort-by', link:'Organizer-Einstellungen öffnen',
        text:'Mit „Sortieren nach“ legst du fest, nach welcher Einheit die Herkunftsdörfer in Massen-UT sortiert werden. Ohne Auswahl bleibt die Spielsortierung bestehen.',
        tip:'Wähle beispielsweise Schwert, wenn diese Einheit deine verfügbaren SD-Pakete begrenzt. Die Sortierung wird zusammen mit der automatischen Vorbereitung angewendet.'},
    {title:'Schwert-Laufzeit prüfen', screen:'settings', target:'#sd-schwertLfz', link:'Organizer-Einstellungen öffnen',
        text:'Prüfe die normale Schwert-Laufzeit deiner Welt in Minuten pro Feld. Sie hilft dem Organizer, die Laufzeit und einen aktiven Unterstützungs-Speedboost für ab/bis-Anfragen zu berücksichtigen.',
        tip:'Trage den Basiswert der Welt ein. Prüfe das Ankunftsfenster vor dem Versand; einen zeitweiligen Speedboost musst du nicht als neuen Basiswert speichern.'},
    {title:'Bereit für die SD-Tabelle', screen:'forum', link:'Stammesforum öffnen',
        text:'Öffne euren SD-Thread. Erkannte SD-Tabellen werden beim Öffnen lokal zugeordnet. Der Link einer Anfrage führt dich mit deinen Einstellungen zu Massen-UT. Prüfe die Auswahl, übernimm sie und sende selbst im Spiel.',
        tip:'Forenmoderatoren können zusätzlich eine SD-Tabelle erstellen und pflegen. Die Seitenhilfe erklärt die jeweiligen Funktionen. Nach dem Versand trägst du die Bearbeitung im Thread ein.'}
];

function isStepPage(context:PageContext, item:SetupStep):boolean {
    return context.screen === item.screen && (!item.mode || context.mode === item.mode) && (!item.type || context.query.type === item.type);
}

export function getSetupValidation(step:number):{valid:boolean; message:string} {
    const storage=LocalStorageHelper.getInstance();
    const checks=[{kind:'groups' as const,id:storage.getSdGroupId,name:'Gruppe'},
        ...(step>0 ? [{kind:'templates' as const,id:storage.getSelectedTemplate,name:'Vorlage'}]:[])];
    for (const item of checks) {
        const check=getCatalogCheck(item.kind);
        if (check.state==='idle' || check.state==='loading') return {valid:false,message:`Die ${item.name} wird im Spiel geprüft …`};
        if (check.state==='error') return {valid:false,message:`Die ${item.name} konnte im Spiel nicht geprüft werden. Öffne die entsprechende Spielseite oder versuche „Erneut prüfen“.`};
        if (!check.ids.length) return {valid:false,message:`Noch keine gespeicherte ${item.name} im Spiel gefunden. Lege sie dort an und speichere sie.`};
        if (!isCatalogSelectionValid(item.kind,item.id)) return {valid:false,message:`Wähle eine im Spiel vorhandene ${item.name} und lege sie als SD-${item.name} fest.`};
    }
    if (step>=7) {
        const input=document.getElementById('sd-schwertLfz') as HTMLInputElement|null;
        const minutes=input ? Number(input.value):storage.getSwordLfz;
        if (!Number.isFinite(minutes) || minutes<=0) return {valid:false,message:'Trage eine gültige Schwert-Laufzeit größer als 0 Minuten pro Feld ein.'};
    }
    return {valid:true,message:step===0 ? 'SD-Gruppe im Spiel gefunden und festgelegt.' : 'SD-Gruppe und SD-Vorlage im Spiel gefunden und festgelegt.'};
}

export function initializeSetupOnboarding(context:PageContext):void {
    $('#sd-setup-launcher,#sd-thread-setup-launcher,#sd-setup-card').remove();
    $(document).off('.sdSetup');
    const storage = LocalStorageHelper.getInstance();
    const saved = storage.getOnboarding?.tours?.[SETUP_KEY];
    const tableEntry=context.context==='forum-view_thread' && !!storage.getAllThreads[context.threadId ?? '']
        && $('#sd-forum-quick-settings .sd-organizer-body').length>0;
    const forumPage=context.screen==='forum' || (context.screen==='ally' && context.mode==='forum');
    // The forum is the entry point. Other pages only show a guide that the user activated.
    if (!forumPage && (!saved || saved.complete || saved.paused)) return;
    ensureOrganizerStyles();
    let step = Math.min(setupSteps.length - 1, saved?.step ?? 0);
    let active = false;
    const candidates:Partial<Record<'groups'|'templates',string>>={};
    const chosen:Partial<Record<'groups'|'templates',boolean>>={};
    const save = (paused:boolean, complete=false) => {
        const current = storage.getOnboarding;
        storage.setOnboarding = {version:current?.version ?? 1, tours:{...current?.tours, [SETUP_KEY]:{step,paused,complete}}};
    };
    const $open=$('<a id="sd-setup-launcher" class="thread_button" href="#" role="button">').append('<span class="thread_new_close sd-setup-open" style="transform:scaleX(-1)"></span>');
    const $middle=$('<span class="thread_new">').appendTo($open);
    $('<img alt="" width="20" height="20" style="vertical-align:middle;margin:-2px 4px 0 0">').attr('src',SETUP_ICON_DATA_URI).appendTo($middle);
    const $label=$('<span style="float:none;display:inline;height:auto;padding:0">').text(saved && !saved.complete ? 'Einrichtung fortsetzen' : 'Einrichtung starten').appendTo($middle);
    $open.append('<span class="thread_new_close"></span>');
    if (forumPage) {
        const $newThread=$('#content_value a.thread_button[href*="mode=new_thread"]').first();
        const $poll=$newThread.parent().find('a.thread_button[href*="mode=new_poll"]').last();
        if ($newThread.length) ($poll.length ? $poll:$newThread).after($open);
    }
    const $threadOpen=$('<button type="button" class="btn" id="sd-thread-setup-launcher" style="width:100%">');
    if (tableEntry) $threadOpen.appendTo('#sd-thread-registration');
    const $entry=tableEntry ? $threadOpen : $open;
    const syncLaunchers=()=>{
        const current=storage.getOnboarding?.tours?.[SETUP_KEY];
        const label=current && !current.complete ? 'Einrichtung fortsetzen' : needsSetup(storage) ? 'Einrichtung starten' : 'Einrichtung prüfen';
        $label.text(label);$threadOpen.text(label);
    };
    syncLaunchers();
    const close = () => {
        active = false;
        $('#sd-setup-card').remove();
        $('.sd-setup-target').removeClass('sd-setup-target');
        layoutOrganizerDocks();
    };
    const pause = () => {
        if (!active) return;
        save(true); close(); syncLaunchers();$entry.trigger('focus');
    };
    const render = (focus=true) => {
        const previousFocus=document.activeElement as HTMLElement|null;
        const previousId=previousFocus?.closest('#sd-setup-card') ? previousFocus.id:'';
        close(); active = true; save(false);
        syncLaunchers();
        $('#sd-onboarding-card').remove(); $('.sd-tour-target').removeClass('sd-tour-target');
        const item = setupSteps[step];
        const here = isStepPage(context,item);
        const $card = $('<aside id="sd-setup-card" class="sd-organizer" role="region" aria-labelledby="sd-setup-title">');
        const $header = $('<div class="sd-setup-header">').append($('<h2 id="sd-setup-title" tabindex="-1">').text('SD Organizer einrichten'));
        $('<button type="button" class="sd-button sd-setup-close" aria-label="Einrichtung pausieren">×</button>').on('click',pause).appendTo($header);
        $card.append($header, $('<p class="sd-setup-progress">').text(`Schritt ${step+1} von ${setupSteps.length} · Fortschritt wird gespeichert`));
        const $list = $('<ol class="sd-setup-checklist" aria-label="Einrichtungsschritte">');
        setupSteps.forEach((s,i) => {
            const $button = $('<button type="button" class="sd-button">').text(`${i+1}. ${s.title}`).attr('aria-current',i === step ? 'step' : null);
            const blocked=i>step && (!getSetupValidation(0).valid || (i>1 && !getSetupValidation(1).valid));
            $button.prop('disabled',blocked).on('click',()=>{if (blocked) return;step=i;render();});
            $('<li>').append($button).appendTo($list);
        });
        $card.append($('<details><summary>Alle Schritte</summary></details>').append($list));
        $card.append($('<section class="sd-tip sd-tip-primary">').append($('<h3>').text(item.title),$('<p>').text(item.text)),
            $('<section class="sd-tip">').append($('<h3>').text('Gut zu wissen'),$('<p>').text(item.tip)));
        if (step <= 1) {
            const kind=step===0 ? 'groups':'templates';
            const name=step===0 ? 'Gruppe':'Vorlage';
            const entries=step===0 ? storage.getGroupData:storage.getTemplateData;
            const selected=step===0 ? storage.getSdGroupId:storage.getSelectedTemplate;
            if (!chosen[kind]) {
                const matches=entries.filter(entry=>/(^|\W)sd(\W|$)|standdeff/i.test(entry.name));
                candidates[kind]=entries.some(entry=>entry.id===selected) ? selected : matches.length===1 ? matches[0].id:'0';
            }
            const candidate=candidates[kind] ?? '0';
            const found=isCatalogSelectionValid(kind,candidate);
            const assigned=found && candidate===selected;
            const $resource=$('<section class="sd-tip sd-setup-resource">');
            $resource.append($('<label for="sd-setup-resource-select">').text(`Gespeicherte ${name} wählen`));
            const $select=$('<select id="sd-setup-resource-select">').append($('<option value="0">').text(`Bitte ${name} wählen`));
            entries.forEach(entry=>$select.append($('<option>').val(entry.id).text(entry.name)));
            $select.val(candidate).on('change',()=>{candidates[kind]=String($select.val());chosen[kind]=true;render(false);});
            $resource.append($select);
            const $checks=$('<ul class="sd-setup-checks" aria-label="Prüfung">');
            $('<li>').addClass(found ? 'sd-check-done':'sd-check-pending').text(`${found ? '✓':'○'} ${name} im Spiel gefunden`).appendTo($checks);
            $('<li>').addClass(assigned ? 'sd-check-done':'sd-check-pending').text(`${assigned ? '✓':'○'} Als SD-${name} festgelegt`).appendTo($checks);
            $resource.append($checks);
            $('<button type="button" class="sd-button">').text(`Als SD-${name} festlegen`).prop('disabled',!found).on('click',()=>{
                if (!isCatalogSelectionValid(kind,candidate)) return;
                if (kind==='groups') storage.setSdGroupId=candidate;else storage.setSelectedTemplate=candidate;
                document.dispatchEvent(new Event('sd-catalog-updated'));
            }).appendTo($resource);
            $card.append($resource);
        }
        if (!here || step === setupSteps.length-1) {
            const threadId=storage.getBunkerImportTargetThreadId;
            const thread=storage.getAllThreads[threadId];
            const last=step===setupSteps.length-1;
            const href=last ? thread ? buildForumThreadUrl(thread.forumId,threadId) : buildGameUrl('ally',{mode:'forum'}) : buildGameUrl(item.screen,{mode:item.mode,type:item.type});
            $('<a class="sd-button sd-primary" id="sd-setup-page-link">').attr('href',href).text(last && thread ? 'SD-Tabelle öffnen' : item.link).on('click',()=>save(false)).appendTo($card);
        } else $card.append($('<p class="sd-setup-status">').text('Du bist auf der passenden Seite. Nimm die Einstellung im Spiel vor und wähle dann „Weiter“.'));
        if (here && item.target) {
            const $target = $(item.target).first();
            $target.addClass('sd-setup-target');
            if (focus) $target[0]?.scrollIntoView?.({block:'center',behavior:'smooth'});
        }
        const $actions = $('<div class="sd-setup-actions">');
        $('<button type="button" class="sd-button">Zurück</button>').prop('disabled',step === 0).on('click',()=>{step--;render();}).appendTo($actions);
        const needsSettings = step >= 2 && step <= 7 && !here;
        const validation=getSetupValidation(step);
        $('<button type="button" class="sd-button sd-primary" id="sd-setup-next">').text(step === setupSteps.length-1 ? 'Einrichtung abschließen' : 'Weiter').prop('disabled',needsSettings || !validation.valid).on('click',()=>{
            if (!getSetupValidation(step).valid || needsSettings) {render(false);return;}
            if (step === setupSteps.length-1) {save(false,true);close();syncLaunchers();$entry.trigger('focus');}
            else {step++;render();}
        }).appendTo($actions);
        $('<button type="button" class="sd-button">Später fortsetzen</button>').on('click',pause).appendTo($actions);
        $card.append($actions);
        $card.append($('<p id="sd-setup-validation" class="sd-setup-status" role="status">').text(validation.message));
        $('<button type="button" class="sd-button">Erneut prüfen</button>').on('click',()=>void refreshGameCatalogs()).appendTo($card);
        $('body').append($card);
        dockOrganizerPanel($card[0],{side:'left',top:140});
        if (focus) $card.find('h2').trigger('focus');
        else if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
        else if (previousId) document.getElementById(previousId)?.focus({preventScroll:true});
    };
    $open.add($threadOpen).on('click',event=>{event.preventDefault();if (storage.getOnboarding?.tours?.[SETUP_KEY]?.complete) step=0;render();void refreshGameCatalogs();});
    $open.on('keydown',event=>{if (event.key===' ') {event.preventDefault();$open.trigger('click');}});
    $(document).on('keydown.sdSetup',event=>{if (event.key === 'Escape') pause();}).on('sd-pause-setup.sdSetup',pause);
    $(document).on('sd-catalog-updated.sdSetup sd-catalog-validated.sdSetup sd-settings-changed.sdSetup',()=>{
        if (active) render(false);
        else {
            syncLaunchers();
            const current=storage.getOnboarding?.tours?.[SETUP_KEY];
            if (tableEntry && needsSetup(storage) && !current?.paused) {if(current?.complete) step=0;render();}
        }
    });
    if ((saved && !saved.paused && !saved.complete) || (tableEntry && needsSetup(storage) && !saved?.paused)) {
        if (saved?.complete) step=0;
        render();void refreshGameCatalogs();
    }
}
