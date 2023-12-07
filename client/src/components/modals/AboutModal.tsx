import React, { useState } from 'react';
import { Tooltip as MantineTooltip } from '@mantine/core';
import { ModalSettings } from '@mantine/modals/lib/context';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import {
  Container,
  Text,
  Group,
  Image,
  Accordion,
  Anchor,
  ScrollArea,
  Button,
  Stack,
  TextInput,
  Textarea,
  LoadingOverlay,
} from '@mantine/core';
import LogoName from 'assets/brand/logo-name.png';
import LogoXYZ from 'assets/sponsors/logo-xyz.png';
import LogoSTR from 'assets/sponsors/logo-sharetheroad.png';
import { EmailApi } from 'api';
import { IContactFormDTO as ContactFormValues } from 'api/interfaces/Email';
import { validateEmail } from 'utils/validation';

export const AboutModal = (isMobileSize: boolean) => {
  return {
    children: <AboutModalContent />,
    size: '600px',
    scrollAreaComponent: isMobileSize ? undefined : ScrollArea.Autosize,
    styles: isMobileSize
      ? {
          inner: {
            padding: '5dvh 0 5dvh !important',
          },
          content: {
            maxHeight: 'calc(100dvh - (5dvh * 2)) !important',
            borderRadius: '0.5rem !important',
          },
        }
      : {},
  } as ModalSettings;
};

const AboutModalContent: React.FC = () => {
  return (
    <Container>
      <Group align='center' position='center' spacing='xl'>
        <Image
          width='unset'
          src={LogoName}
          height={75}
          fit='contain'
          alt='SafeCycle'
          withPlaceholder
        />
      </Group>
      <Text mb='sm' mt='md'>
        SafeCycle is a bike route planning tool and navigation app with a
        primary focus on finding safe and comfortable bike routes for users.
      </Text>

      <Text mb='sm'>
        Using a combination of comfort-focused preferences and a unique "nogo"
        feature, SafeCycle can guide cyclists of all ages and abilities, even in
        regions with poor cycling infrastructure and high levels of motor
        vehicle traffic.
      </Text>

      <Accordion variant='contained' defaultValue={null}>
        <Accordion.Item value='contact'>
          <Accordion.Control>
            <b>Contact us</b>
          </Accordion.Control>
          <Accordion.Panel>
            <ContactForm />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Text mt='lg' mb='sm' ta='center' size='sm' fs='italic'>
        SafeCycle is made possible thanks to the following:
      </Text>
      <Group
        position='center'
        spacing='xl'
        noWrap
        style={{ maxWidth: 230, maxHeight: 100, margin: 'auto' }}
      >
        <MantineTooltip label='XYZ Digital Inc.'>
          <Image
            src={LogoXYZ}
            height='max-content'
            width={125}
            fit='contain'
            withPlaceholder
            style={{ cursor: 'pointer' }}
            onClick={() => {
              window.open('https://www.xyzdigital.com/', '_blank');
            }}
          />
        </MantineTooltip>
        <MantineTooltip label='Share the Road Essex County'>
          <Image
            src={LogoSTR}
            height='max-content'
            width={75}
            fit='contain'
            withPlaceholder
            style={{ cursor: 'pointer' }}
            onClick={() => {
              window.open(
                'https://www.facebook.com/ShareTheRoadEssexCounty',
                '_blank'
              );
            }}
          />
        </MantineTooltip>
      </Group>
      <Text align='center' fs='italic' size='sm' color='dimmed' mt='xl'>
        Roadway conditions are ever changing. Although SafeCycle can help make
        your route choices safer, users bear full responsibility for their own
        safety. Ride at your own risk.
      </Text>
      <Group mt='lg' position='center'>
        <Anchor
          href='/policies/privacy.html'
          color='dimmed'
          size='xs'
          target='_blank'
        >
          Privacy Policy
        </Anchor>
        <Anchor
          href='/policies/cookies.html'
          color='dimmed'
          size='xs'
          target='_blank'
        >
          Cookie Policy
        </Anchor>
      </Group>
    </Container>
  );
};

const ContactForm: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);

  const form = useForm({
    initialValues: {
      name: {
        first: '',
        last: '',
      },
      email: '',
      subject: '',
      message: '',
    } as ContactFormValues,
    validate: {
      name: {
        first: (value) => {
          if (!value) return 'First name is required';
          return null;
        },
        last: (value) => {
          if (!value) return 'Last name is required';
          return null;
        },
      },
      email: (value) => {
        if (!value) return 'Email is required';
        return validateEmail(value) ? null : 'Invalid email';
      },
      subject: (value) => {
        if (!value) return 'Subject is required';
        return null;
      },
      message: (value) => {
        if (!value) return 'Message is required';
        return null;
      },
    },
  });

  const handleSubmit = (values: ContactFormValues) => {
    setPendingResponse(true);
    EmailApi.submitContactForm(values)
      .then((success) => {
        if (!success) throw new Error('Email could not be sent');
        setFormSubmitted(true);
        setPendingResponse(false);
      })
      .catch((error) => {
        showNotification({
          title: 'Error submiting form',
          message: error.message || 'Undefined error',
          color: 'red',
        });
        setPendingResponse(false);
      });
  };

  return (
    <Stack spacing='md'>
      <Text size='sm'>
        If you would like to report a bug or incorrect nogo data, or have
        questions and/or concerns about SafeCycle, please get in touch by
        submitting the following form.
      </Text>
      {formSubmitted ? (
        <Text h={200} mt='xl' align='center' italic>
          Thank you for contacting us! We'll be in touch soon.
        </Text>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Container h={500} maw={400} m='auto' pos='relative'>
            <LoadingOverlay visible={pendingResponse} overlayBlur={2} />
            <Stack spacing='xs'>
              <Group position='apart' grow>
                <TextInput
                  withAsterisk
                  label='First Name'
                  placeholder='John'
                  {...form.getInputProps('name.first')}
                />
                <TextInput
                  withAsterisk
                  label='Last Name'
                  placeholder='Smith'
                  {...form.getInputProps('name.last')}
                />
              </Group>
              <TextInput
                withAsterisk
                label='Email'
                placeholder='your@email.com'
                {...form.getInputProps('email')}
              />
              <TextInput
                withAsterisk
                label='Subject'
                placeholder='Enter a subject'
                {...form.getInputProps('subject')}
              />
              <Textarea
                withAsterisk
                label='Message'
                placeholder='Enter your message'
                minRows={8}
                {...form.getInputProps('message')}
              />
            </Stack>
            <Group position='right' mt='md'>
              <Button type='submit'>Submit</Button>
            </Group>
          </Container>
        </form>
      )}
    </Stack>
  );
};
