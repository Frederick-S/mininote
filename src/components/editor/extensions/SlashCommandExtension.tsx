import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { SlashCommandMenu } from '../SlashCommandMenu.tsx';

export const SlashCommandExtension = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                render: () => {
                    let component: ReactRenderer;
                    let popup: TippyInstance[];

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(SlashCommandMenu, {
                                props: {
                                    query: props.query,
                                    editor: props.editor,
                                    range: props.range,
                                    command: props.command,
                                },
                                editor: props.editor,
                            });

                            if (!props.clientRect) {
                                return;
                            }

                            popup = tippy('body', {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            });
                        },

                        onUpdate(props: any) {
                            component.updateProps({
                                query: props.query,
                                editor: props.editor,
                                range: props.range,
                                command: props.command,
                            });

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props: any) {
                            console.log('Extension onKeyDown:', props.event.key, 'component.ref:', component?.ref);
                            
                            if (props.event.key === 'Escape') {
                                popup[0].hide();
                                return true;
                            }

                            // Try to get the ref and call onKeyDown
                            if (component?.ref && typeof component.ref === 'object') {
                                const ref = component.ref as any;
                                console.log('Calling ref.onKeyDown');
                                if (ref.onKeyDown) {
                                    return ref.onKeyDown(props);
                                }
                            }

                            return false;
                        },

                        onExit() {
                            popup[0].destroy();
                            component.destroy();
                        },
                    };
                },
            }),
        ];
    },
});
